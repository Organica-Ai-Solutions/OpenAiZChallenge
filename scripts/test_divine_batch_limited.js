#!/usr/bin/env node

const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration
const FALLBACK_BACKEND_URL = 'http://localhost:8003';
const STORAGE_BACKEND_URL = 'http://localhost:8004';
const SITES_FILE = 'all_sites_enhanced_20250625_193953.json';
const TEST_LIMIT = 3; // Only process first 3 sites for testing

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

class LimitedDivineTest {
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

    async runDivineAnalysis(site) {
        const { coordinates, site_id, name } = site;
        const [lat, lng] = coordinates.split(', ').map(coord => parseFloat(coord.trim()));
        
        this.log(`🔮 Running divine analysis for: ${name} (${site_id})`, 'magenta');
        this.log(`📍 Coordinates: ${lat}, ${lng}`, 'cyan');

        try {
            const jsonData = JSON.stringify({
                lat: lat,
                lng: lng,
                source: "enhanced"
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
            this.log(`🔍 Pattern: ${analysisResult.pattern_type}`, 'cyan');
            this.log(`📝 Description: ${analysisResult.description}`, 'cyan');

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
                agent_performance: analysisResult.agent_performance || {},
                pattern_type: analysisResult.pattern_type,
                description: analysisResult.description,
                cultural_indicators: analysisResult.cultural_indicators || [],
                historical_context: analysisResult.historical_context
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
            
            // Debug the response
            this.log(`🔍 Storage response: ${stdout}`, 'cyan');
            
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

    async run() {
        this.log('🧪 Starting Limited Divine Analysis Test (3 sites)', 'bold');
        this.log('=' .repeat(50), 'blue');

        try {
            // Load sites database
            const sitesData = JSON.parse(fs.readFileSync(SITES_FILE, 'utf8'));
            const allSites = sitesData.enhanced_sites || [];
            const testSites = allSites.slice(0, TEST_LIMIT);
            
            this.log(`📊 Testing ${testSites.length} sites out of ${allSites.length} total`, 'cyan');

            // Process each test site
            for (let i = 0; i < testSites.length; i++) {
                const site = testSites[i];
                this.log(`[${i + 1}/${testSites.length}] Processing: ${site.name}`, 'bold');

                // Run divine analysis
                const analysisResult = await this.runDivineAnalysis(site);
                
                // Store the result
                if (analysisResult) {
                    await this.storeAnalysisResult(analysisResult, site);
                }

                this.processedSites++;

                // Small delay between sites
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Verify storage
            this.log('🔍 Verifying storage...', 'blue');
            const { stdout: statsOutput } = await execAsync(`curl -s ${STORAGE_BACKEND_URL}/storage/stats`);
            const stats = JSON.parse(statsOutput);

            this.log(`📊 Storage Statistics:`, 'cyan');
            this.log(`   Total analyses: ${stats.total_analyses}`, 'cyan');
            this.log(`   Divine analyses: ${stats.analyses_by_type?.divine || 0}`, 'cyan');
            this.log(`   High confidence: ${stats.high_confidence_count}`, 'cyan');

            // Final report
            this.log('=' .repeat(50), 'blue');
            this.log('🎉 LIMITED TEST COMPLETE', 'bold');
            this.log('=' .repeat(50), 'blue');

            const elapsed = (Date.now() - this.startTime) / 1000;
            const successRate = (this.successfulAnalyses / this.processedSites * 100).toFixed(1);
            const storageRate = this.successfulAnalyses > 0 ? (this.storedAnalyses / this.successfulAnalyses * 100).toFixed(1) : 0;

            this.log(`📊 Test Results:`, 'cyan');
            this.log(`   Sites processed: ${this.processedSites}`, 'cyan');
            this.log(`   Successful analyses: ${this.successfulAnalyses}`, 'green');
            this.log(`   Stored analyses: ${this.storedAnalyses}`, 'green');
            this.log(`   Success rate: ${successRate}%`, 'yellow');
            this.log(`   Storage rate: ${storageRate}%`, 'yellow');
            this.log(`   Total time: ${Math.round(elapsed)} seconds`, 'cyan');

            if (this.errors.length > 0) {
                this.log(`⚠️ Errors encountered: ${this.errors.length}`, 'yellow');
                this.errors.forEach(error => {
                    this.log(`   ${error.site_id}: ${error.error} (${error.step})`, 'red');
                });
            }

            if (this.successfulAnalyses > 0 && this.storedAnalyses > 0) {
                this.log('✅ Test successful! Ready for full batch processing.', 'green');
            } else {
                this.log('❌ Test failed. Check configuration before full batch.', 'red');
            }

        } catch (error) {
            this.log(`❌ Test failed: ${error.message}`, 'red');
        }
    }
}

// Run the limited test
const tester = new LimitedDivineTest();
tester.run(); 