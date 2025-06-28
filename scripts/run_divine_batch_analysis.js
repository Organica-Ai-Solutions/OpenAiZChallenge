#!/usr/bin/env node

const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration
const FALLBACK_BACKEND_URL = 'http://localhost:8003';
const STORAGE_BACKEND_URL = 'http://localhost:8004';
const SITES_FILE = 'all_sites_enhanced_20250625_193953.json';

// Colors for output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

class DivineAnalysisBatch {
    constructor() {
        this.processedSites = 0;
        this.successfulAnalyses = 0;
        this.storedAnalyses = 0;
        this.errors = [];
        this.startTime = Date.now();
    }

    log(message, color = 'reset') {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
    }

    async checkBackendHealth() {
        this.log('🔍 Checking backend health...', 'blue');
        
        try {
            // Check fallback backend
            const { stdout: fallbackHealth } = await execAsync(`curl -s ${FALLBACK_BACKEND_URL}/system/health`);
            const fallbackStatus = JSON.parse(fallbackHealth);
            this.log(`✅ Fallback Backend: ${fallbackStatus.status} (v${fallbackStatus.version})`, 'green');

            // Check storage backend
            const { stdout: storageHealth } = await execAsync(`curl -s ${STORAGE_BACKEND_URL}/health`);
            const storageStatus = JSON.parse(storageHealth);
            this.log(`✅ Storage Backend: ${storageStatus.status} (v${storageStatus.version})`, 'green');

            return true;
        } catch (error) {
            this.log(`❌ Backend health check failed: ${error.message}`, 'red');
            return false;
        }
    }

    async loadSitesDatabase() {
        this.log('📖 Loading sites database...', 'blue');
        
        try {
            const sitesData = JSON.parse(fs.readFileSync(SITES_FILE, 'utf8'));
            const sites = sitesData.enhanced_sites || [];
            
            this.log(`📊 Found ${sites.length} sites in database`, 'green');
            this.log(`📈 Total features in database: ${sitesData.metadata.total_features_discovered}`, 'cyan');
            
            return sites;
        } catch (error) {
            this.log(`❌ Failed to load sites database: ${error.message}`, 'red');
            return [];
        }
    }

    async runDivineAnalysis(site) {
        const { coordinates, site_id, name } = site;
        const [lat, lng] = coordinates.split(', ').map(coord => parseFloat(coord.trim()));
        
        this.log(`🔮 Running divine analysis for: ${name} (${site_id})`, 'magenta');
        this.log(`📍 Coordinates: ${lat}, ${lng}`, 'cyan');

        try {
            const jsonData = JSON.stringify({
                lat: lat,
                lng: lng,
                radius: 10,
                analysis_type: "divine"
            });
            
            // Write JSON to temp file to avoid escaping issues
            const tempFile = `temp_divine_${site_id}_${Date.now()}.json`;
            fs.writeFileSync(tempFile, jsonData);
            
            const curlCommand = `curl -s -X POST "${FALLBACK_BACKEND_URL}/analyze" ` +
                `-H "Content-Type: application/json" ` +
                `-d @${tempFile}`;

            const { stdout } = await execAsync(curlCommand);
            
            // Cleanup temp file
            try {
                fs.unlinkSync(tempFile);
            } catch {}
            const analysisResult = JSON.parse(stdout);

            if (analysisResult.error) {
                throw new Error(analysisResult.error);
            }

            this.log(`✨ Divine analysis completed for ${site_id}`, 'green');
            this.log(`🎯 Confidence: ${(analysisResult.confidence * 100).toFixed(1)}%`, 'yellow');
            this.log(`🔍 Features detected: ${analysisResult.features_detected || 0}`, 'cyan');

            this.successfulAnalyses++;
            return analysisResult;

        } catch (error) {
            this.log(`❌ Divine analysis failed for ${site_id}: ${error.message}`, 'red');
            this.errors.push({ site_id, error: error.message, step: 'divine_analysis' });
            return null;
        }
    }

    async storeAnalysisResult(analysisResult, site) {
        if (!analysisResult) return false;

        try {
            // Prepare storage data - fix coordinates format
            let coordinates = analysisResult.coordinates || { lat: 0, lng: 0 };
            if (coordinates.lon !== undefined && coordinates.lng === undefined) {
                coordinates = { lat: coordinates.lat, lng: coordinates.lon };
            }
            
            const storageData = {
                analysis_id: analysisResult.analysis_id || `divine_${Date.now()}`,
                coordinates: coordinates,
                analysis_type: 'divine',
                confidence: analysisResult.confidence || 0,
                features_detected: analysisResult.features_detected || 0,
                detected_features: analysisResult.detected_features || [],
                cultural_assessment: analysisResult.cultural_assessment || {},
                site_id: site.site_id,
                site_name: site.name,
                timestamp: new Date().toISOString(),
                archaeologically_significant: true, // Divine analyses are always significant
                analysis_depth: 'divine',
                agent_performance: analysisResult.agent_performance || {}
            };

            // Write storage data to temp file to avoid escaping issues
            const storageFile = `temp_storage_${site.site_id}_${Date.now()}.json`;
            fs.writeFileSync(storageFile, JSON.stringify(storageData));
            
            const curlCommand = `curl -s -X POST "${STORAGE_BACKEND_URL}/storage/save" ` +
                `-H "Content-Type: application/json" ` +
                `-d @${storageFile}`;

            const { stdout } = await execAsync(curlCommand);
            
            // Cleanup temp file
            try {
                fs.unlinkSync(storageFile);
            } catch {}
            
            const storageResult = JSON.parse(stdout);

            if (storageResult.success) {
                this.log(`💾 Analysis stored successfully for ${site.site_id}`, 'green');
                this.log(`📋 Storage reason: ${storageResult.storage_reason || storageResult.message}`, 'cyan');
                this.storedAnalyses++;
                return true;
            } else {
                this.log(`⚠️ Storage rejected for ${site.site_id}: ${storageResult.storage_reason || storageResult.message || 'Unknown error'}`, 'yellow');
                return false;
            }

        } catch (error) {
            this.log(`❌ Storage failed for ${site.site_id}: ${error.message}`, 'red');
            this.errors.push({ site_id: site.site_id, error: error.message, step: 'storage' });
            return false;
        }
    }

    async verifyStorageRetrieval() {
        this.log('🔍 Verifying storage retrieval...', 'blue');

        try {
            // Get storage statistics
            const { stdout: statsOutput } = await execAsync(`curl -s ${STORAGE_BACKEND_URL}/storage/stats`);
            const stats = JSON.parse(statsOutput);

            this.log(`📊 Storage Statistics:`, 'cyan');
            this.log(`   Total analyses: ${stats.total_analyses}`, 'cyan');
            this.log(`   Divine analyses: ${stats.analyses_by_type.divine || 0}`, 'cyan');
            this.log(`   High confidence: ${stats.high_confidence_count}`, 'cyan');

            // Get high confidence analyses
            const { stdout: highConfOutput } = await execAsync(`curl -s ${STORAGE_BACKEND_URL}/storage/high-confidence`);
            const highConfAnalyses = JSON.parse(highConfOutput);

            this.log(`🎯 High confidence analyses available: ${highConfAnalyses.length}`, 'green');

            // Get archaeological sites
            const { stdout: sitesOutput } = await execAsync(`curl -s ${STORAGE_BACKEND_URL}/storage/sites`);
            const archaeologicalSites = JSON.parse(sitesOutput);

            this.log(`🏛️ Archaeological sites in storage: ${archaeologicalSites.length}`, 'green');

            return true;

        } catch (error) {
            this.log(`❌ Storage verification failed: ${error.message}`, 'red');
            return false;
        }
    }

    async processSite(site, index, total) {
        const progress = `[${index + 1}/${total}]`;
        this.log(`${progress} Processing: ${site.name} (${site.site_id})`, 'bold');

        // Run divine analysis
        const analysisResult = await this.runDivineAnalysis(site);
        
        // Store the result
        if (analysisResult) {
            await this.storeAnalysisResult(analysisResult, site);
        }

        this.processedSites++;

        // Progress update every 10 sites
        if ((index + 1) % 10 === 0) {
            const elapsed = (Date.now() - this.startTime) / 1000;
            const rate = this.processedSites / elapsed;
            const remaining = total - this.processedSites;
            const eta = remaining / rate;

            this.log(`📈 Progress: ${this.processedSites}/${total} sites processed`, 'yellow');
            this.log(`⚡ Rate: ${rate.toFixed(2)} sites/second`, 'yellow');
            this.log(`⏱️ ETA: ${Math.round(eta)} seconds`, 'yellow');
        }

        // Small delay to avoid overwhelming the backends
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    async run() {
        this.log('🚀 Starting Divine Analysis Batch Processing', 'bold');
        this.log('=' .repeat(60), 'blue');

        // Check backend health
        const healthyBackends = await this.checkBackendHealth();
        if (!healthyBackends) {
            this.log('❌ Backend health check failed. Exiting.', 'red');
            return;
        }

        // Load sites database
        const sites = await this.loadSitesDatabase();
        if (sites.length === 0) {
            this.log('❌ No sites found in database. Exiting.', 'red');
            return;
        }

        this.log(`🎯 Starting batch processing of ${sites.length} sites...`, 'green');
        this.log('=' .repeat(60), 'blue');

        // Process each site
        for (let i = 0; i < sites.length; i++) {
            await this.processSite(sites[i], i, sites.length);
        }

        // Final verification
        await this.verifyStorageRetrieval();

        // Final report
        this.log('=' .repeat(60), 'blue');
        this.log('🎉 DIVINE ANALYSIS BATCH COMPLETE', 'bold');
        this.log('=' .repeat(60), 'blue');

        const elapsed = (Date.now() - this.startTime) / 1000;
        const successRate = (this.successfulAnalyses / this.processedSites * 100).toFixed(1);
        const storageRate = (this.storedAnalyses / this.successfulAnalyses * 100).toFixed(1);

        this.log(`📊 Final Statistics:`, 'cyan');
        this.log(`   Sites processed: ${this.processedSites}`, 'cyan');
        this.log(`   Successful analyses: ${this.successfulAnalyses}`, 'green');
        this.log(`   Stored analyses: ${this.storedAnalyses}`, 'green');
        this.log(`   Success rate: ${successRate}%`, 'yellow');
        this.log(`   Storage rate: ${storageRate}%`, 'yellow');
        this.log(`   Total time: ${Math.round(elapsed)} seconds`, 'cyan');
        this.log(`   Average rate: ${(this.processedSites / elapsed).toFixed(2)} sites/second`, 'cyan');

        if (this.errors.length > 0) {
            this.log(`⚠️ Errors encountered: ${this.errors.length}`, 'yellow');
            this.errors.forEach(error => {
                this.log(`   ${error.site_id}: ${error.error} (${error.step})`, 'red');
            });
        }

        this.log('✅ All divine analyses completed and stored!', 'green');
        this.log('🎯 Card system can now retrieve enhanced data!', 'magenta');
    }
}

// Run the batch processor
if (require.main === module) {
    const processor = new DivineAnalysisBatch();
    processor.run().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = DivineAnalysisBatch; 