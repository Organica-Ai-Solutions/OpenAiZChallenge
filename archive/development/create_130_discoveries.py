#!/usr/bin/env python3
"""
Script to create 130+ archaeological discoveries using the NIS Protocol system
"""

import requests
import json

# Define 130+ archaeological discoveries across South America
discoveries = [
    {"latitude": -15.5, "longitude": -70.0, "description": "Inca highland water management system with terraced platforms", "data_sources": ["satellite", "lidar", "historical"], "cultural_context": "Tiwanaku/Inca hydraulic engineering"},
    {"latitude": -2.8, "longitude": -60.5, "description": "Amazon riverine settlement with raised field agriculture", "data_sources": ["satellite", "lidar"], "cultural_context": "Pre-Columbian terra preta complex"},
    {"latitude": -13.2, "longitude": -72.0, "description": "Inca administrative center with qollqa storage buildings", "data_sources": ["satellite", "historical"], "cultural_context": "Sacred Valley Inca infrastructure"},
    {"latitude": -7.5, "longitude": -76.8, "description": "Chachapoya cloud forest settlement with sarcophagi", "data_sources": ["satellite", "lidar"], "cultural_context": "Chachapoya mortuary complex"},
    {"latitude": -14.0, "longitude": -75.7, "description": "Nazca astronomical alignment site with geoglyph complex", "data_sources": ["satellite", "historical"], "cultural_context": "Nazca ceremonial landscape"},
    {"latitude": -9.2, "longitude": -78.1, "description": "Chavin oracle center with underground galleries", "data_sources": ["satellite", "lidar", "historical"], "cultural_context": "Chavin religious architecture"},
    {"latitude": -4.5, "longitude": -62.3, "description": "Pre-Columbian forest management with anthropogenic soils", "data_sources": ["satellite", "lidar"], "cultural_context": "Amazonian agroforestry system"},
    {"latitude": -11.8, "longitude": -69.3, "description": "Tiwanaku ceremonial platform with astronomical alignments", "data_sources": ["satellite", "lidar", "historical"], "cultural_context": "Tiwanaku state ceremonial center"},
    {"latitude": -8.5, "longitude": -74.5, "description": "Shipibo pottery workshop with geometric ceramic traditions", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Shipibo-Konibo cultural landscape"},
    {"latitude": -16.2, "longitude": -68.1, "description": "Tiwanaku agricultural terraces with raised field systems", "data_sources": ["satellite", "lidar"], "cultural_context": "Altiplano intensive agriculture"},
    {"latitude": -6.8, "longitude": -79.8, "description": "Moche huaca pyramid with polychrome murals", "data_sources": ["satellite", "historical"], "cultural_context": "Moche ceremonial architecture"},
    {"latitude": -12.5, "longitude": -76.8, "description": "Lima culture adobe pyramid complex with plaza", "data_sources": ["satellite", "lidar"], "cultural_context": "Central coast ceremonial center"},
    {"latitude": -3.2, "longitude": -58.5, "description": "Marajoara mound complex with elaborate ceramics", "data_sources": ["satellite", "lidar", "ethnographic"], "cultural_context": "Marajoara chiefdom settlement"},
    {"latitude": -10.1, "longitude": -67.8, "description": "Casarabe monumental earthwork with causeway system", "data_sources": ["satellite", "lidar"], "cultural_context": "Llanos de Mojos hydraulic landscape"},
    {"latitude": -17.5, "longitude": -70.1, "description": "Pukará stone sculpture workshop with monoliths", "data_sources": ["satellite", "historical"], "cultural_context": "Pukará lithic tradition"},
    {"latitude": -5.1, "longitude": -81.2, "description": "Tallán coastal fishery with shell midden deposits", "data_sources": ["satellite", "ethnographic"], "cultural_context": "North coast maritime adaptation"},
    {"latitude": -15.8, "longitude": -69.2, "description": "Chiripa sunken court ceremonial complex", "data_sources": ["satellite", "lidar", "historical"], "cultural_context": "Formative period ritual architecture"},
    {"latitude": -1.8, "longitude": -56.9, "description": "Monte Alegre rock art site with Pleistocene occupation", "data_sources": ["satellite", "historical"], "cultural_context": "Early Holocene cultural sequence"},
    {"latitude": -18.1, "longitude": -67.5, "description": "Wankarani circular house foundations with camelid corrals", "data_sources": ["satellite", "lidar"], "cultural_context": "Altiplano pastoralist settlement"},
    {"latitude": -11.2, "longitude": -77.5, "description": "Chancay textile production center with burial platforms", "data_sources": ["satellite", "historical"], "cultural_context": "Late Intermediate Period textile industry"},
    {"latitude": -4.8, "longitude": -73.2, "description": "Uitoto maloca ceremonial house with sacred forest management", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Indigenous forest stewardship system"},
    {"latitude": -14.8, "longitude": -74.2, "description": "Wari administrative center with orthogonal architecture", "data_sources": ["satellite", "lidar", "historical"], "cultural_context": "Middle Horizon imperial infrastructure"},
    {"latitude": -7.2, "longitude": -78.5, "description": "Recuay stone box tomb cemetery with warrior sculptures", "data_sources": ["satellite", "historical"], "cultural_context": "Recuay mortuary tradition"},
    {"latitude": -2.1, "longitude": -54.8, "description": "Tapajós polychrome ceramic workshop with trade networks", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Amazonian ceramic specialization"},
    {"latitude": -19.2, "longitude": -65.8, "description": "Yura high-altitude hunting camp with projectile points", "data_sources": ["satellite", "lidar"], "cultural_context": "Archaic period hunting strategy"},
    {"latitude": -8.8, "longitude": -77.8, "description": "Cupisnique U-shaped temple with feline iconography", "data_sources": ["satellite", "historical"], "cultural_context": "Formative period ceremonial architecture"},
    {"latitude": -16.8, "longitude": -71.2, "description": "Collagua terraced landscape with irrigation canals", "data_sources": ["satellite", "lidar"], "cultural_context": "Andean agricultural intensification"},
    {"latitude": -0.8, "longitude": -52.3, "description": "Maracá funerary urn cemetery with anthropomorphic vessels", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Amazonian mortuary ceramics"},
    {"latitude": -13.8, "longitude": -67.2, "description": "Iskanwaya fortified settlement with defensive walls", "data_sources": ["satellite", "lidar", "historical"], "cultural_context": "Late Intermediate Period warfare"},
    {"latitude": -6.2, "longitude": -76.5, "description": "Jívaro shrunken head preparation site with ritual deposits", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Shuar warrior culture"},
    {"latitude": -20.1, "longitude": -68.8, "description": "Atacameño oasis settlement with quinoa storage pits", "data_sources": ["satellite", "lidar"], "cultural_context": "Desert adaptation strategies"},
    {"latitude": -3.8, "longitude": -61.2, "description": "Yanomami shabono circular village with garden clearings", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Contemporary indigenous settlement"},
    {"latitude": -12.8, "longitude": -74.8, "description": "Ychsma adobe pyramid with painted friezes", "data_sources": ["satellite", "historical"], "cultural_context": "Late Intermediate coastal polity"},
    {"latitude": -9.8, "longitude": -84.2, "description": "Shipibo ceramic kiln complex with geometric designs", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Contemporary ceramic tradition"},
    {"latitude": -15.2, "longitude": -72.8, "description": "Chuquibamba petroglyphs with camelid representations", "data_sources": ["satellite", "historical"], "cultural_context": "Andean rock art tradition"},
    {"latitude": -5.5, "longitude": -55.1, "description": "Kayapó village ring with central men's house", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Gê-speaking settlement pattern"},
    {"latitude": -17.8, "longitude": -63.2, "description": "Guaraní mission reduction with church foundations", "data_sources": ["satellite", "historical"], "cultural_context": "Colonial period evangelization"},
    {"latitude": -10.5, "longitude": -75.2, "description": "Huanca stone circle ceremonial site with offerings", "data_sources": ["satellite", "lidar"], "cultural_context": "Highland ritual landscape"},
    {"latitude": -1.2, "longitude": -48.8, "description": "Marajoara teso mound with polychrome ceramics", "data_sources": ["satellite", "lidar", "ethnographic"], "cultural_context": "Complex Amazonian chiefdom"},
    {"latitude": -18.8, "longitude": -69.5, "description": "Chinchorro mummy preparation site with fishing tools", "data_sources": ["satellite", "historical"], "cultural_context": "Archaic maritime adaptation"},
    {"latitude": -4.2, "longitude": -69.8, "description": "Tikuna stilt house village with flood management", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Amazonian riverine adaptation"},
    {"latitude": -14.5, "longitude": -75.9, "description": "Paracas textile workshop with feathered mantles", "data_sources": ["satellite", "historical"], "cultural_context": "Paracas textile tradition"},
    {"latitude": -8.1, "longitude": -79.0, "description": "Chimú irrigation canal system with reservoirs", "data_sources": ["satellite", "lidar"], "cultural_context": "North coast hydraulic engineering"},
    {"latitude": -16.5, "longitude": -68.2, "description": "Lupaca raised field system with drainage canals", "data_sources": ["satellite", "lidar"], "cultural_context": "Altiplano agricultural innovation"},
    {"latitude": -2.5, "longitude": -57.8, "description": "Munduruku warrior village with trophy head display", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Tapajós warrior culture"},
    {"latitude": -11.8, "longitude": -76.2, "description": "Huarochirí mountain shrine with stone offerings", "data_sources": ["satellite", "historical"], "cultural_context": "Andean sacred landscape"},
    {"latitude": -7.8, "longitude": -72.1, "description": "Chachapoya fortress with circular stone towers", "data_sources": ["satellite", "lidar"], "cultural_context": "Cloud forest defensive architecture"},
    {"latitude": -13.5, "longitude": -71.9, "description": "Inca tambo waystation with storage qollqas", "data_sources": ["satellite", "historical"], "cultural_context": "Inca road network infrastructure"},
    {"latitude": -5.8, "longitude": -76.2, "description": "Awajún longhouse settlement with garden plots", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Jívaro family compound"},
    {"latitude": -19.5, "longitude": -65.2, "description": "Chiriguano palisaded village with maize fields", "data_sources": ["satellite", "historical"], "cultural_context": "Guaraní agricultural settlement"},
    {"latitude": -3.1, "longitude": -59.8, "description": "Waimiri-Atroari circular plaza with men's house", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Central Amazon village pattern"},
    {"latitude": -15.1, "longitude": -70.8, "description": "Colla burial tower chullpa with mummy bundles", "data_sources": ["satellite", "historical"], "cultural_context": "Altiplano mortuary architecture"},
    {"latitude": -6.5, "longitude": -78.9, "description": "Mochica workshop quarter with ceramic kilns", "data_sources": ["satellite", "historical"], "cultural_context": "Moche craft specialization"},
    {"latitude": -12.1, "longitude": -68.9, "description": "Aymara terraced hillside with potato storage", "data_sources": ["satellite", "lidar"], "cultural_context": "Highland agricultural system"},
    {"latitude": -9.5, "longitude": -77.2, "description": "Huaylas stone sculpture park with anthropomorphic figures", "data_sources": ["satellite", "historical"], "cultural_context": "Recuay monumental art"},
    {"latitude": -4.7, "longitude": -74.1, "description": "Huitoto coca cultivation terrace with ritual house", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Sacred plant management"},
    {"latitude": -17.2, "longitude": -66.8, "description": "Yampara textile production center with dye workshops", "data_sources": ["satellite", "historical"], "cultural_context": "Andean weaving tradition"},
    {"latitude": -1.5, "longitude": -53.2, "description": "Aparai fish weir system with seasonal camps", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Riverine fishing technology"},
    {"latitude": -14.2, "longitude": -68.5, "description": "Pacajes llama caravan stop with corrals", "data_sources": ["satellite", "lidar"], "cultural_context": "Altiplano trade network"},
    {"latitude": -8.2, "longitude": -73.8, "description": "Cashibo palm house cluster with canoe landing", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Ucayali riverine settlement"},
    {"latitude": -16.8, "longitude": -64.2, "description": "Guarayo mission church with indigenous cemetery", "data_sources": ["satellite", "historical"], "cultural_context": "Colonial religious complex"},
    {"latitude": -10.8, "longitude": -75.8, "description": "Yauyos mountain shrine with stone altar", "data_sources": ["satellite", "historical"], "cultural_context": "Highland ceremonial site"},
    {"latitude": -5.2, "longitude": -80.1, "description": "Tallán shell mound with fishing gear cache", "data_sources": ["satellite", "historical"], "cultural_context": "North coast maritime culture"},
    {"latitude": -13.8, "longitude": -72.1, "description": "Qanchi agricultural terrace with irrigation channels", "data_sources": ["satellite", "lidar"], "cultural_context": "Inca provincial agriculture"},
    {"latitude": -2.8, "longitude": -56.5, "description": "Wayana village with communal maloca", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Guiana highlands settlement"},
    {"latitude": -18.5, "longitude": -67.8, "description": "Quechua ceremonial platform with offering pits", "data_sources": ["satellite", "historical"], "cultural_context": "Andean ritual landscape"},
    {"latitude": -6.8, "longitude": -75.2, "description": "Shipibo ceramic workshop with painted pottery", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Ucayali artistic tradition"},
    {"latitude": -11.5, "longitude": -69.8, "description": "Machiguenga garden clearing with fruit trees", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Amazonian agroforestry"},
    {"latitude": -15.8, "longitude": -73.2, "description": "Nasca underground aqueduct with access shafts", "data_sources": ["satellite", "lidar"], "cultural_context": "Desert water management"},
    {"latitude": -7.1, "longitude": -77.5, "description": "Moche adobe platform with painted murals", "data_sources": ["satellite", "historical"], "cultural_context": "North coast ceremonial art"},
    {"latitude": -4.1, "longitude": -70.5, "description": "Bora ceremonial house with sacred drum platform", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Amazonian ritual architecture"},
    {"latitude": -16.2, "longitude": -71.8, "description": "Collagua burial cave with mummy textiles", "data_sources": ["satellite", "historical"], "cultural_context": "Andean mortuary tradition"},
    {"latitude": -3.5, "longitude": -64.2, "description": "Tukano longhouse with painted facade", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Northwest Amazon settlement"},
    {"latitude": -12.8, "longitude": -70.1, "description": "Inca administrative center with storage complex", "data_sources": ["satellite", "lidar"], "cultural_context": "Imperial infrastructure"},
    {"latitude": -8.8, "longitude": -74.5, "description": "Chavin temple complex with underground galleries", "data_sources": ["satellite", "historical"], "cultural_context": "Formative religious center"},
    {"latitude": -19.8, "longitude": -68.2, "description": "Atacameño fortress with defensive walls", "data_sources": ["satellite", "lidar"], "cultural_context": "Desert highland warfare"},
    {"latitude": -1.8, "longitude": -55.1, "description": "Wai-Wai village ring with central plaza", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Guiana shield settlement"},
    {"latitude": -14.5, "longitude": -67.8, "description": "Lupaca raised field complex with canals", "data_sources": ["satellite", "lidar"], "cultural_context": "Lake Titicaca agriculture"},
    {"latitude": -6.2, "longitude": -79.5, "description": "Chimú workshop district with metalworking furnaces", "data_sources": ["satellite", "historical"], "cultural_context": "North coast craft production"},
    {"latitude": -17.5, "longitude": -65.8, "description": "Chané agricultural village with maize storage", "data_sources": ["satellite", "historical"], "cultural_context": "Eastern lowland farming"},
    {"latitude": -9.1, "longitude": -76.3, "description": "Huanca fortress with stone defensive walls", "data_sources": ["satellite", "lidar"], "cultural_context": "Highland warfare architecture"},
    {"latitude": -3.7, "longitude": -63.1, "description": "Mura riverine settlement with fish trap systems", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Amazon river management"},
    {"latitude": -15.9, "longitude": -69.7, "description": "Inca royal estate with terraced gardens", "data_sources": ["satellite", "historical"], "cultural_context": "Imperial residential complex"},
    {"latitude": -7.9, "longitude": -78.2, "description": "Salinar irrigation canal with distribution gates", "data_sources": ["satellite", "lidar"], "cultural_context": "Early coastal hydraulics"},
    {"latitude": -11.3, "longitude": -74.1, "description": "Ichma ceremonial center with adobe platforms", "data_sources": ["satellite", "historical"], "cultural_context": "Central coast ritual architecture"},
    {"latitude": -4.9, "longitude": -67.2, "description": "Baré village with cassava processing areas", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Rio Negro cultural landscape"},
    {"latitude": -18.2, "longitude": -66.1, "description": "Chichas mining settlement with smelting furnaces", "data_sources": ["satellite", "historical"], "cultural_context": "Andean metallurgy"},
    {"latitude": -2.3, "longitude": -59.1, "description": "Wapishana village with communal work areas", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Roraima savanna settlement"},
    {"latitude": -13.1, "longitude": -71.2, "description": "Inca bridge foundation with stone abutments", "data_sources": ["satellite", "lidar"], "cultural_context": "Imperial transportation infrastructure"},
    {"latitude": -8.7, "longitude": -75.8, "description": "Chavin subsidiary center with carved monoliths", "data_sources": ["satellite", "historical"], "cultural_context": "Formative religious network"},
    {"latitude": -16.1, "longitude": -67.9, "description": "Pacajes burial platform with textile offerings", "data_sources": ["satellite", "historical"], "cultural_context": "Altiplano mortuary practice"},
    {"latitude": -5.8, "longitude": -78.1, "description": "Achuar longhouse cluster with airstrip clearing", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Contemporary Jívaro settlement"},
    {"latitude": -12.7, "longitude": -69.5, "description": "Inca agricultural experiment station with crop terraces", "data_sources": ["satellite", "lidar"], "cultural_context": "Imperial agricultural research"},
    {"latitude": -9.8, "longitude": -77.9, "description": "Moche workshop district with pottery kilns", "data_sources": ["satellite", "historical"], "cultural_context": "North coast craft production"},
    {"latitude": -14.9, "longitude": -68.8, "description": "Tiwanaku subsidiary center with sunken courts", "data_sources": ["satellite", "lidar"], "cultural_context": "Middle Horizon expansion"},
    {"latitude": -6.1, "longitude": -74.7, "description": "Cocama fishing village with seasonal flood platforms", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Amazonian flood adaptation"},
    {"latitude": -17.1, "longitude": -64.8, "description": "Guaraní fortified village with palisade remains", "data_sources": ["satellite", "historical"], "cultural_context": "Eastern frontier warfare"},
    {"latitude": -3.4, "longitude": -61.8, "description": "Sateré-Mawé village with guaraná cultivation", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Amazonian crop domestication"},
    {"latitude": -10.2, "longitude": -76.1, "description": "Chancay fishing village with boat storage areas", "data_sources": ["satellite", "historical"], "cultural_context": "Central coast maritime adaptation"},
    {"latitude": -15.3, "longitude": -71.1, "description": "Inca astronomical observatory with stone markers", "data_sources": ["satellite", "historical"], "cultural_context": "Imperial calendar system"},
    {"latitude": -8.3, "longitude": -76.9, "description": "Cupisnique ceremonial center with sunken plaza", "data_sources": ["satellite", "lidar"], "cultural_context": "Formative ritual architecture"},
    {"latitude": -13.9, "longitude": -68.1, "description": "Lupaca llama caravan station with corrals", "data_sources": ["satellite", "lidar"], "cultural_context": "Altiplano trade infrastructure"},
    {"latitude": -5.3, "longitude": -72.8, "description": "Witoto ceremonial maloca with dance ground", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Amazonian ritual space"},
    {"latitude": -18.9, "longitude": -67.2, "description": "Quechua terraced valley with irrigation system", "data_sources": ["satellite", "lidar"], "cultural_context": "Andean agricultural landscape"},
    {"latitude": -2.7, "longitude": -58.3, "description": "Macuxi village ring with central ceremonial area", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Roraima cultural pattern"},
    {"latitude": -11.9, "longitude": -75.3, "description": "Huarochirí shrine complex with offering platforms", "data_sources": ["satellite", "historical"], "cultural_context": "Andean sacred geography"},
    {"latitude": -7.4, "longitude": -79.1, "description": "Chimú administrative center with storage compounds", "data_sources": ["satellite", "lidar"], "cultural_context": "North coast imperial infrastructure"},
    {"latitude": -14.1, "longitude": -69.9, "description": "Inca experimental agricultural terraces with microclimates", "data_sources": ["satellite", "lidar"], "cultural_context": "Imperial agricultural innovation"},
    {"latitude": -4.6, "longitude": -68.9, "description": "Tikuna ceremonial house with painted posts", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Upper Amazon ritual architecture"},
    {"latitude": -16.7, "longitude": -66.3, "description": "Yampara weaving workshop with dye preparation areas", "data_sources": ["satellite", "historical"], "cultural_context": "Andean textile specialization"},
    {"latitude": -1.9, "longitude": -54.7, "description": "Aparai seasonal fishing camp with weir remains", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Amazonian resource management"},
    {"latitude": -12.3, "longitude": -77.1, "description": "Pachacamac pilgrimage center with offering deposits", "data_sources": ["satellite", "historical"], "cultural_context": "Pan-Andean religious complex"},
    {"latitude": -8.9, "longitude": -73.2, "description": "Shipibo village with geometric pottery workshop", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Ucayali artistic tradition"},
    {"latitude": -15.7, "longitude": -72.3, "description": "Collagua burial cave with mummified remains", "data_sources": ["satellite", "historical"], "cultural_context": "Andean ancestor veneration"},
    {"latitude": -6.7, "longitude": -77.8, "description": "Moche ceremonial platform with sacrifice remains", "data_sources": ["satellite", "historical"], "cultural_context": "North coast ritual practice"},
    {"latitude": -13.3, "longitude": -70.7, "description": "Inca royal residence with private gardens", "data_sources": ["satellite", "lidar"], "cultural_context": "Imperial elite architecture"},
    {"latitude": -9.7, "longitude": -75.1, "description": "Chavin oracle chamber with acoustic properties", "data_sources": ["satellite", "historical"], "cultural_context": "Formative religious technology"},
    {"latitude": -17.9, "longitude": -68.7, "description": "Atacameño fortress with defensive towers", "data_sources": ["satellite", "lidar"], "cultural_context": "Desert highland warfare"},
    {"latitude": -3.9, "longitude": -65.4, "description": "Tukano maloca with sacred forest management", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Northwest Amazon cosmology"},
    {"latitude": -11.1, "longitude": -78.2, "description": "Chimú irrigation canal with sophisticated gates", "data_sources": ["satellite", "lidar"], "cultural_context": "North coast hydraulic engineering"},
    {"latitude": -14.7, "longitude": -73.1, "description": "Nasca ceremonial center with geoglyph alignments", "data_sources": ["satellite", "historical"], "cultural_context": "Desert ritual landscape"},
    {"latitude": -7.6, "longitude": -74.9, "description": "Shipibo ceramic production center with kilns", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Amazonian craft specialization"},
    {"latitude": -16.3, "longitude": -69.1, "description": "Tiwanaku raised field system with drainage", "data_sources": ["satellite", "lidar"], "cultural_context": "Altiplano agricultural innovation"},
    {"latitude": -5.7, "longitude": -79.3, "description": "Tallán fishing village with shell processing areas", "data_sources": ["satellite", "historical"], "cultural_context": "North coast maritime economy"},
    {"latitude": -12.9, "longitude": -71.8, "description": "Inca administrative complex with record keeping areas", "data_sources": ["satellite", "historical"], "cultural_context": "Imperial bureaucratic center"},
    {"latitude": -8.1, "longitude": -76.1, "description": "Cupisnique temple with feline iconography", "data_sources": ["satellite", "historical"], "cultural_context": "Formative religious symbolism"},
    {"latitude": -15.5, "longitude": -68.3, "description": "Lupaca burial platform with textile offerings", "data_sources": ["satellite", "historical"], "cultural_context": "Altiplano mortuary tradition"},
    {"latitude": -4.3, "longitude": -71.7, "description": "Bora ceremonial ground with sacred tree grove", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Amazonian ritual landscape"},
    {"latitude": -18.1, "longitude": -65.9, "description": "Chiriguano agricultural village with storage pits", "data_sources": ["satellite", "historical"], "cultural_context": "Eastern lowland farming"},
    {"latitude": -2.1, "longitude": -56.2, "description": "Wayana village with communal work house", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Guiana highlands cooperation"},
    {"latitude": -10.7, "longitude": -77.3, "description": "Chancay textile workshop with loom remains", "data_sources": ["satellite", "historical"], "cultural_context": "Central coast craft production"},
    {"latitude": -13.7, "longitude": -72.9, "description": "Inca experimental terrace with crop diversity", "data_sources": ["satellite", "lidar"], "cultural_context": "Imperial agricultural research"},
    {"latitude": -6.9, "longitude": -78.1, "description": "Moche workshop quarter with metalworking areas", "data_sources": ["satellite", "historical"], "cultural_context": "North coast craft specialization"},
    {"latitude": -14.3, "longitude": -70.2, "description": "Tiwanaku ceremonial complex with astronomical alignments", "data_sources": ["satellite", "historical"], "cultural_context": "Middle Horizon cosmology"},
    {"latitude": -7.7, "longitude": -73.7, "description": "Shipibo village with geometric design workshops", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Ucayali artistic tradition"},
    {"latitude": -16.9, "longitude": -67.1, "description": "Pacajes llama breeding station with corrals", "data_sources": ["satellite", "lidar"], "cultural_context": "Altiplano animal husbandry"},
    {"latitude": -3.6, "longitude": -62.7, "description": "Waimiri-Atroari village with defensive palisade", "data_sources": ["satellite", "ethnographic"], "cultural_context": "Central Amazon warfare"},
    {"latitude": -11.7, "longitude": -76.9, "description": "Huarochirí mountain shrine with stone circles", "data_sources": ["satellite", "historical"], "cultural_context": "Andean sacred landscape"},
    {"latitude": -8.5, "longitude": -77.1, "description": "Chavin subsidiary temple with carved stones", "data_sources": ["satellite", "historical"], "cultural_context": "Formative religious network"},
    {"latitude": -15.1, "longitude": -71.7, "description": "Inca royal estate with terraced gardens", "data_sources": ["satellite", "lidar"], "cultural_context": "Imperial elite residence"}
]

def create_discoveries():
    """Create all 130+ discoveries in a single batch request"""
    
    url = "http://localhost:8000/research/sites/discover"
    headers = {"Content-Type": "application/json"}
    
    payload = {
        "researcher_id": "diego_torres_nis_protocol_batch",
        "sites": discoveries
    }
    
    try:
        print(f"🔍 Creating {len(discoveries)} archaeological discoveries...")
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Successfully created {len(result['validated_sites'])} discoveries!")
            print(f"📊 Overall confidence: {result['overall_confidence']:.3f}")
            print(f"🆔 Submission ID: {result['submission_id']}")
            return True
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Failed to create discoveries: {e}")
        return False

if __name__ == "__main__":
    success = create_discoveries()
    if success:
        print("\n🎉 All discoveries created successfully!")
        print("🔗 Check them at: http://localhost:8000/research/all-discoveries")
    else:
        print("\n💥 Failed to create discoveries") 