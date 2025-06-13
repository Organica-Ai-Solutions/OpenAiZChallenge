# Advanced Archaeological Analysis Endpoints for Context Menu System

@app.post("/api/analyze-cultural-significance")
async def analyze_cultural_significance(request: Dict[str, Any]) -> Dict[str, Any]:
    """Deep analysis of cultural significance for selected area."""
    try:
        area = request.get('area', {})
        sites = request.get('sites', [])
        
        # Simulate comprehensive cultural analysis
        cultural_indicators = []
        
        # Analyze site types and their cultural relationships
        site_types = [site.get('type', 'unknown') for site in sites]
        type_counts = {t: site_types.count(t) for t in set(site_types)}
        
        # Cultural significance scoring
        significance_score = 0
        analysis_details = []
        
        if 'ceremonial' in type_counts:
            significance_score += type_counts['ceremonial'] * 0.25
            analysis_details.append(f"Contains {type_counts['ceremonial']} ceremonial sites indicating strong religious/spiritual significance")
            cultural_indicators.append("Ritual/Religious Complex")
        
        if 'settlement' in type_counts:
            significance_score += type_counts['settlement'] * 0.15
            analysis_details.append(f"Features {type_counts['settlement']} settlement sites suggesting organized community presence")
            cultural_indicators.append("Urban Development")
        
        if 'burial' in type_counts:
            significance_score += type_counts['burial'] * 0.20
            analysis_details.append(f"Includes {type_counts['burial']} burial sites revealing death/ancestor veneration practices")
            cultural_indicators.append("Mortuary Traditions")
        
        if 'trade' in type_counts:
            significance_score += type_counts['trade'] * 0.18
            analysis_details.append(f"Has {type_counts['trade']} trade sites indicating economic importance and connectivity")
            cultural_indicators.append("Economic Networks")
        
        # Period analysis for temporal cultural context
        periods = [site.get('period', 'unknown') for site in sites]
        unique_periods = list(set([p for p in periods if p != 'unknown']))
        
        if len(unique_periods) > 1:
            analysis_details.append(f"Multi-period occupation ({', '.join(unique_periods[:3])}) suggests long-term cultural importance")
            significance_score += 0.15
        
        # Cultural significance interpretation
        if significance_score >= 0.8:
            significance_level = "Exceptional"
            interpretation = "This area represents a major cultural center with profound archaeological importance"
        elif significance_score >= 0.6:
            significance_level = "High"
            interpretation = "Significant cultural site complex with multiple important archaeological features"
        elif significance_score >= 0.4:
            significance_level = "Moderate"
            interpretation = "Moderately significant cultural area with notable archaeological remains"
        else:
            significance_level = "Limited"
            interpretation = "Area shows some cultural activity but limited archaeological significance"
        
        return {
            "analysis_type": "Cultural Significance Analysis",
            "significance_score": round(significance_score, 2),
            "significance_level": significance_level,
            "cultural_indicators": cultural_indicators,
            "interpretation": interpretation,
            "detailed_analysis": analysis_details,
            "sites_analyzed": len(sites),
            "recommendations": [
                "Detailed ground survey recommended for high-significance areas",
                "Consider cultural resource management protocols",
                "Evaluate potential for heritage designation",
                "Assess community/stakeholder engagement needs"
            ],
            "confidence": 0.87,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        return {"error": f"Cultural significance analysis failed: {str(e)}"}

@app.post("/api/analyze-settlement-patterns")
async def analyze_settlement_patterns(request: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze settlement patterns and spatial organization."""
    try:
        area = request.get('area', {})
        sites = request.get('sites', [])
        
        settlement_sites = [s for s in sites if s.get('type') == 'settlement']
        
        if not settlement_sites:
            return {
                "analysis_type": "Settlement Pattern Analysis",
                "pattern_type": "No Settlements",
                "interpretation": "No settlement sites detected in selected area",
                "confidence": 0.95
            }
        
        # Spatial analysis
        patterns = []
        
        # Cluster analysis
        if len(settlement_sites) >= 3:
            patterns.append("Clustered Settlement Pattern")
            spatial_organization = "Nucleated - settlements form distinct clusters suggesting centralized social organization"
        elif len(settlement_sites) == 2:
            patterns.append("Paired Settlement Pattern")
            spatial_organization = "Binary - two settlements may indicate complementary functions or temporal succession"
        else:
            patterns.append("Isolated Settlement")
            spatial_organization = "Single settlement indicates either specialized function or sparse population"
        
        # Size analysis
        sizes = [s.get('size_hectares', 10) for s in settlement_sites if s.get('size_hectares')]
        if sizes:
            avg_size = sum(sizes) / len(sizes)
            if avg_size > 50:
                patterns.append("Large Settlement Complex")
                size_interpretation = "Large settlements suggest urban centers with complex social hierarchies"
            elif avg_size > 20:
                patterns.append("Medium Settlement Network")
                size_interpretation = "Medium-sized settlements indicate established communities with organized infrastructure"
            else:
                patterns.append("Small Settlement Pattern")
                size_interpretation = "Small settlements suggest village-level organization or specialized sites"
        else:
            size_interpretation = "Settlement sizes not available for analysis"
        
        # Temporal analysis
        periods = [s.get('period', 'unknown') for s in settlement_sites]
        unique_periods = list(set([p for p in periods if p != 'unknown']))
        
        if len(unique_periods) > 1:
            temporal_pattern = "Multi-period Occupation"
            temporal_interpretation = f"Continuous or repeated occupation across {len(unique_periods)} periods indicates strategic location value"
        else:
            temporal_pattern = "Single Period"
            temporal_interpretation = f"Single period occupation during {unique_periods[0] if unique_periods else 'unknown period'}"
        
        return {
            "analysis_type": "Settlement Pattern Analysis",
            "settlement_count": len(settlement_sites),
            "spatial_organization": spatial_organization,
            "size_interpretation": size_interpretation,
            "temporal_pattern": temporal_pattern,
            "temporal_interpretation": temporal_interpretation,
            "identified_patterns": patterns,
            "archaeological_implications": [
                "Settlement clustering indicates social cohesion and resource sharing",
                "Large settlements suggest hierarchical social organization",
                "Multi-period occupation indicates long-term environmental suitability",
                "Settlement spacing reveals territorial organization and resource management"
            ],
            "confidence": 0.83,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        return {"error": f"Settlement pattern analysis failed: {str(e)}"}

@app.post("/api/analyze-chronological-sequence")
async def analyze_chronological_sequence(request: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze chronological sequences and temporal relationships."""
    try:
        area = request.get('area', {})
        sites = request.get('sites', [])
        
        # Extract and analyze periods
        periods = []
        for site in sites:
            period = site.get('period', 'unknown')
            if period != 'unknown':
                periods.append({
                    'site': site.get('name', 'unnamed'),
                    'period': period,
                    'type': site.get('type', 'unknown'),
                    'confidence': site.get('confidence', 0.5)
                })
        
        if not periods:
            return {
                "analysis_type": "Chronological Sequence Analysis",
                "sequence": [],
                "interpretation": "No temporal data available for chronological analysis",
                "confidence": 0.2
            }
        
        # Sort by approximate chronological order (simplified)
        period_order = {
            'Archaic': 1, 'Early': 2, 'Middle': 3, 'Late': 4, 'Post': 5,
            'Paleo': 0, 'Formative': 2, 'Classic': 3, 'Post-Classic': 4,
            'Pre-Columbian': 2, 'Colonial': 5, 'Historic': 6
        }
        
        def get_period_weight(period_str):
            for key in period_order:
                if key.lower() in period_str.lower():
                    return period_order[key]
            return 3  # Default middle position
        
        sorted_periods = sorted(periods, key=lambda x: get_period_weight(x['period']))
        
        # Analyze sequence
        sequence_analysis = []
        unique_periods = list(set([p['period'] for p in periods]))
        
        for period in unique_periods:
            period_sites = [p for p in periods if p['period'] == period]
            site_types = [s['type'] for s in period_sites]
            type_distribution = {t: site_types.count(t) for t in set(site_types)}
            
            sequence_analysis.append({
                'period': period,
                'site_count': len(period_sites),
                'dominant_types': list(type_distribution.keys()),
                'interpretation': f"Period characterized by {', '.join(type_distribution.keys())} activities"
            })
        
        # Generate chronological interpretation
        if len(unique_periods) == 1:
            interpretation = f"Single period occupation during {unique_periods[0]} suggests focused temporal use"
        elif len(unique_periods) <= 3:
            interpretation = f"Multi-period sequence ({len(unique_periods)} periods) indicates long-term significance"
        else:
            interpretation = f"Complex chronological sequence ({len(unique_periods)} periods) suggests continuous cultural importance"
        
        return {
            "analysis_type": "Chronological Sequence Analysis",
            "total_periods": len(unique_periods),
            "chronological_span": f"{min(unique_periods)} to {max(unique_periods)}",
            "sequence_analysis": sequence_analysis,
            "temporal_patterns": [
                "Site type evolution over time",
                "Continuity and discontinuity patterns",
                "Cultural transition indicators",
                "Occupation intensity variations"
            ],
            "interpretation": interpretation,
            "archaeological_significance": [
                "Temporal depth indicates long-term cultural attachment",
                "Sequence changes reveal cultural adaptation",
                "Multi-period sites suggest strategic locations",
                "Chronological gaps may indicate environmental or social disruption"
            ],
            "confidence": 0.79,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        return {"error": f"Chronological sequence analysis failed: {str(e)}"}

@app.post("/api/analyze-trade-networks")
async def analyze_trade_networks(request: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze potential trade networks and economic connections."""
    try:
        area = request.get('area', {})
        sites = request.get('sites', [])
        
        trade_sites = [s for s in sites if s.get('type') == 'trade']
        settlement_sites = [s for s in sites if s.get('type') == 'settlement']
        
        # Network analysis
        network_indicators = []
        trade_interpretation = []
        
        if trade_sites:
            network_indicators.append(f"Direct Trade Evidence: {len(trade_sites)} trade sites")
            trade_interpretation.append("Presence of dedicated trade sites indicates organized commercial activity")
        
        if settlement_sites and len(settlement_sites) >= 2:
            network_indicators.append(f"Settlement Network: {len(settlement_sites)} interconnected settlements")
            trade_interpretation.append("Multiple settlements suggest inter-site exchange and resource sharing")
        
        # Economic complexity analysis
        site_types = [s.get('type') for s in sites]
        economic_diversity = len(set(site_types))
        
        if economic_diversity >= 4:
            complexity = "High Economic Complexity"
            complexity_interpretation = "Diverse site types indicate specialized economic roles and exchange systems"
        elif economic_diversity >= 3:
            complexity = "Moderate Economic Complexity"
            complexity_interpretation = "Multiple site types suggest developing economic specialization"
        else:
            complexity = "Limited Economic Complexity"
            complexity_interpretation = "Few site types indicate subsistence-level economy with limited trade"
        
        # Distance analysis for trade feasibility
        potential_routes = []
        if len(sites) >= 2:
            for i, site1 in enumerate(sites):
                for site2 in sites[i+1:]:
                    # Simplified distance calculation
                    potential_routes.append({
                        'from': site1.get('name', 'unknown'),
                        'to': site2.get('name', 'unknown'),
                        'feasible': True,  # Simplified - all routes considered feasible
                        'rationale': 'Within regional exchange network range'
                    })
        
        return {
            "analysis_type": "Trade Network Analysis",
            "network_complexity": complexity,
            "complexity_interpretation": complexity_interpretation,
            "trade_indicators": network_indicators,
            "economic_interpretation": trade_interpretation,
            "potential_trade_routes": len(potential_routes),
            "route_examples": potential_routes[:5],  # First 5 routes
            "trade_goods_potential": [
                "Foodstuffs and agricultural products",
                "Craft goods and manufactured items",
                "Raw materials and natural resources",
                "Prestige goods and ceremonial objects"
            ],
            "network_analysis": [
                "Central places identification",
                "Resource distribution patterns",
                "Exchange mechanism assessment",
                "Economic integration evaluation"
            ],
            "archaeological_implications": [
                "Trade sites indicate market-based economy",
                "Settlement networks enable resource redistribution",
                "Economic specialization drives social complexity",
                "Exchange systems reflect political organization"
            ],
            "confidence": 0.76,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        return {"error": f"Trade network analysis failed: {str(e)}"}

@app.post("/api/analyze-environmental-factors")
async def analyze_environmental_factors(request: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze environmental factors affecting site locations and usage."""
    try:
        area = request.get('area', {})
        sites = request.get('sites', [])
        
        # Simulate environmental analysis based on site characteristics
        environmental_factors = {
            "water_access": "Moderate",
            "terrain_suitability": "Good", 
            "resource_availability": "High",
            "climate_stability": "Favorable",
            "natural_hazards": "Low Risk"
        }
        
        # Site distribution analysis
        site_types = [s.get('type') for s in sites]
        agricultural_sites = site_types.count('agricultural')
        settlement_sites = site_types.count('settlement')
        
        environmental_interpretation = []
        
        if agricultural_sites > 0:
            environmental_interpretation.append(f"Agricultural sites ({agricultural_sites}) indicate fertile soils and adequate water supply")
            environmental_factors["agricultural_potential"] = "High"
        
        if settlement_sites > 0:
            environmental_interpretation.append(f"Settlement concentration suggests favorable environmental conditions for habitation")
            environmental_factors["habitability"] = "Excellent"
        
        # Climate and resource analysis
        environmental_advantages = [
            "Strategic location for resource exploitation",
            "Favorable topography for settlement establishment", 
            "Adequate water resources for sustained occupation",
            "Climate suitable for year-round habitation",
            "Natural protection from environmental hazards"
        ]
        
        environmental_challenges = [
            "Seasonal resource variability requires adaptation",
            "Flood risk during monsoon periods",
            "Soil erosion potential on sloped terrain",
            "Competition for water resources during dry seasons"
        ]
        
        return {
            "analysis_type": "Environmental Factor Analysis",
            "environmental_rating": "Favorable",
            "key_factors": environmental_factors,
            "environmental_advantages": environmental_advantages,
            "environmental_challenges": environmental_challenges,
            "interpretation": environmental_interpretation,
            "adaptation_strategies": [
                "Water management systems for seasonal variation",
                "Terracing and erosion control measures",
                "Diversified subsistence strategies",
                "Settlement placement for natural protection"
            ],
            "landscape_archaeology": [
                "Site catchment analysis reveals resource territories",
                "Topographic preferences indicate settlement strategies",
                "Environmental constraints shaped cultural adaptation",
                "Resource distribution influenced social organization"
            ],
            "confidence": 0.81,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        return {"error": f"Environmental factor analysis failed: {str(e)}"}

@app.post("/api/analyze-population-density")
async def analyze_population_density(request: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze population density and demographic patterns."""
    try:
        area = request.get('area', {})
        sites = request.get('sites', [])
        
        # Calculate area size estimation
        area_km2 = 25  # Simplified - assume 5x5 km analysis area
        
        # Population estimation based on sites
        settlement_sites = [s for s in sites if s.get('type') == 'settlement']
        
        if not settlement_sites:
            return {
                "analysis_type": "Population Density Analysis",
                "population_estimate": "No settlement data available",
                "density_category": "Unknown",
                "confidence": 0.1
            }
        
        # Estimate population based on settlement sizes
        total_population = 0
        for site in settlement_sites:
            size = site.get('size_hectares', 5)
            # Rough estimate: 10-50 people per hectare for ancient settlements
            site_population = size * 25  # Middle estimate
            total_population += site_population
        
        population_density = total_population / area_km2
        
        # Categorize density
        if population_density > 100:
            density_category = "High Density"
            density_interpretation = "Urban-level population concentration with complex social organization"
        elif population_density > 50:
            density_category = "Moderate Density"
            density_interpretation = "Village-level concentration with organized community structure"
        elif population_density > 20:
            density_category = "Low-Moderate Density"
            density_interpretation = "Dispersed settlement pattern with small community groups"
        else:
            density_category = "Low Density"
            density_interpretation = "Sparse population with possible seasonal or specialized occupation"
        
        # Demographic analysis
        demographic_indicators = [
            f"Estimated {int(total_population)} individuals across {len(settlement_sites)} settlements",
            f"Average settlement size: {int(total_population/len(settlement_sites))} individuals",
            f"Population density: {population_density:.1f} people per km²"
        ]
        
        return {
            "analysis_type": "Population Density Analysis",
            "estimated_population": int(total_population),
            "population_density_per_km2": round(population_density, 1),
            "density_category": density_category,
            "density_interpretation": density_interpretation,
            "settlement_count": len(settlement_sites),
            "demographic_indicators": demographic_indicators,
            "social_implications": [
                "Population density affects social complexity",
                "Settlement clustering indicates social cooperation",
                "Large populations require organized resource management",
                "Demographic pressure drives technological innovation"
            ],
            "archaeological_context": [
                "Dense settlements suggest permanent occupation",
                "Population estimates inform site significance",
                "Demographic analysis reveals social organization",
                "Settlement size correlates with political complexity"
            ],
            "confidence": 0.73,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        return {"error": f"Population density analysis failed: {str(e)}"}

@app.post("/api/analyze-defensive-strategies")
async def analyze_defensive_strategies(request: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze defensive strategies and military organization."""
    try:
        area = request.get('area', {})
        sites = request.get('sites', [])
        
        defensive_sites = [s for s in sites if s.get('type') == 'defensive']
        settlement_sites = [s for s in sites if s.get('type') == 'settlement']
        
        defensive_analysis = []
        strategic_assessment = []
        
        if defensive_sites:
            defensive_analysis.append(f"Fortified positions: {len(defensive_sites)} defensive sites identified")
            strategic_assessment.append("Presence of defensive sites indicates organized military planning")
        
        if settlement_sites:
            protected_settlements = len(settlement_sites)
            defensive_analysis.append(f"Protected settlements: {protected_settlements} settlements within defensive network")
            
            if defensive_sites and settlement_sites:
                protection_ratio = len(defensive_sites) / len(settlement_sites)
                if protection_ratio >= 0.5:
                    strategic_assessment.append("High fortification density indicates conflict-prone environment")
                else:
                    strategic_assessment.append("Moderate fortification suggests periodic security concerns")
        
        # Military organization assessment
        if defensive_sites:
            military_complexity = "Organized Defense System"
            military_interpretation = "Coordinated defensive network requires centralized military planning"
        elif len(settlement_sites) > 3:
            military_complexity = "Community Defense"
            military_interpretation = "Large settlements likely had local defense capabilities"
        else:
            military_complexity = "Limited Defense"
            military_interpretation = "Small-scale or peaceful community with minimal defensive needs"
        
        # Strategic location analysis
        strategic_advantages = [
            "Elevated positions provide tactical advantage",
            "Natural barriers enhance defensive capabilities",
            "Proximity to resources enables sustained defense",
            "Communication networks facilitate coordination"
        ]
        
        return {
            "analysis_type": "Defensive Strategy Analysis",
            "defensive_site_count": len(defensive_sites),
            "protected_settlements": len(settlement_sites),
            "military_complexity": military_complexity,
            "military_interpretation": military_interpretation,
            "defensive_analysis": defensive_analysis,
            "strategic_assessment": strategic_assessment,
            "strategic_advantages": strategic_advantages,
            "warfare_implications": [
                "Defensive sites indicate conflict or threat perception",
                "Fortification investment reflects social organization",
                "Military architecture reveals technological capabilities",
                "Defense networks suggest territorial control"
            ],
            "archaeological_insights": [
                "Defensive sites often preserve military technology",
                "Fortification styles indicate cultural influences",
                "Defensive planning reveals settlement hierarchies",
                "Military sites show evidence of conflict events"
            ],
            "confidence": 0.78,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        return {"error": f"Defensive strategy analysis failed: {str(e)}"}

@app.post("/api/analyze-complete")
async def analyze_complete(request: Dict[str, Any]) -> Dict[str, Any]:
    """Comprehensive multi-dimensional archaeological analysis."""
    try:
        area = request.get('area', {})
        sites = request.get('sites', [])
        
        if not sites:
            return {
                "analysis_type": "Complete Archaeological Analysis",
                "error": "No sites available for analysis",
                "confidence": 0.1
            }
        
        # Perform all analysis types
        cultural_analysis = await analyze_cultural_significance(request)
        settlement_analysis = await analyze_settlement_patterns(request)
        chronological_analysis = await analyze_chronological_sequence(request)
        trade_analysis = await analyze_trade_networks(request)
        environmental_analysis = await analyze_environmental_factors(request)
        population_analysis = await analyze_population_density(request)
        defensive_analysis = await analyze_defensive_strategies(request)
        
        # Synthesize results
        synthesis = {
            "site_count": len(sites),
            "analysis_coverage": "Complete multi-dimensional analysis",
            "key_findings": [
                f"Cultural significance: {cultural_analysis.get('significance_level', 'unknown')}",
                f"Settlement pattern: {settlement_analysis.get('spatial_organization', 'unknown')}",
                f"Temporal span: {chronological_analysis.get('total_periods', 0)} periods",
                f"Economic complexity: {trade_analysis.get('network_complexity', 'unknown')}",
                f"Population density: {population_analysis.get('density_category', 'unknown')}",
                f"Defensive status: {defensive_analysis.get('military_complexity', 'unknown')}"
            ],
            "integrated_interpretation": generate_integrated_interpretation(sites),
            "research_priorities": [
                "Detailed excavation of high-significance sites",
                "Chronological refinement through dating",
                "Artifact analysis for trade network evidence",
                "Environmental reconstruction studies",
                "Social organization analysis"
            ],
            "conservation_recommendations": [
                "Immediate protection for high-value sites",
                "Long-term monitoring program establishment",
                "Community engagement and education",
                "Research collaboration framework",
                "Heritage management planning"
            ]
        }
        
        return {
            "analysis_type": "Complete Archaeological Analysis",
            "comprehensive_results": {
                "cultural_significance": cultural_analysis,
                "settlement_patterns": settlement_analysis,
                "chronological_sequence": chronological_analysis,
                "trade_networks": trade_analysis,
                "environmental_factors": environmental_analysis,
                "population_density": population_analysis,
                "defensive_strategies": defensive_analysis
            },
            "synthesis": synthesis,
            "overall_confidence": 0.84,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        return {"error": f"Complete analysis failed: {str(e)}"}

def generate_integrated_interpretation(sites: List[Dict[str, Any]]) -> str:
    """Generate integrated archaeological interpretation."""
    site_types = [s.get('type', 'unknown') for s in sites]
    type_counts = {t: site_types.count(t) for t in set(site_types)}
    
    interpretation_parts = []
    
    # Dominant site type interpretation
    if max(type_counts.values()) > len(sites) * 0.4:
        dominant_type = max(type_counts, key=type_counts.get)
        interpretation_parts.append(f"Area dominated by {dominant_type} sites")
    else:
        interpretation_parts.append("Area shows diverse site types indicating multi-functional landscape")
    
    # Complexity assessment
    if len(type_counts) >= 4:
        interpretation_parts.append("High archaeological complexity suggests major cultural center")
    elif len(type_counts) >= 3:
        interpretation_parts.append("Moderate complexity indicates established cultural landscape")
    else:
        interpretation_parts.append("Focused cultural activity with specialized functions")
    
    # Temporal significance
    periods = [s.get('period', '') for s in sites if s.get('period')]
    unique_periods = len(set(periods))
    if unique_periods > 2:
        interpretation_parts.append("Multi-period occupation demonstrates long-term cultural significance")
    
    return ". ".join(interpretation_parts) + "." 