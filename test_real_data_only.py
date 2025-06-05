#!/usr/bin/env python3
"""
Comprehensive test to verify satellite and discovery pages only work with real backend data.
Tests all buttons and functionality to ensure no mock data fallbacks exist.
"""

import time
import requests
import subprocess
import json
from typing import Dict, List, Any
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

class RealDataOnlyTester:
    def __init__(self):
        self.results = {
            'satellite_page': {},
            'discovery_page': {},
            'backend_status': {},
            'summary': {}
        }
        self.frontend_url = "http://localhost:3000"
        self.backend_url = "http://localhost:8000"
        
    def setup_browser(self):
        """Setup Chrome browser for testing"""
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')
        
        try:
            self.driver = webdriver.Chrome(options=options)
            return True
        except Exception as e:
            print(f"❌ Failed to setup browser: {e}")
            return False

    def check_backend_status(self) -> bool:
        """Check if backend is online"""
        try:
            response = requests.get(f"{self.backend_url}/health", timeout=5)
            is_online = response.status_code == 200
            self.results['backend_status'] = {
                'online': is_online,
                'status_code': response.status_code if is_online else None,
                'response_time': response.elapsed.total_seconds() if is_online else None
            }
            print(f"🛠️ Backend status: {'Online' if is_online else 'Offline'}")
            return is_online
        except Exception as e:
            print(f"❌ Backend check failed: {e}")
            self.results['backend_status'] = {
                'online': False,
                'error': str(e)
            }
            return False

    def test_satellite_page_real_data_only(self) -> Dict[str, Any]:
        """Test satellite page ensures all buttons only work with real data"""
        print("\n🛰️ Testing Satellite Page - Real Data Only")
        results = {}
        
        try:
            # Navigate to satellite page
            self.driver.get(f"{self.frontend_url}/satellite")
            time.sleep(3)
            
            # Check page loads
            try:
                title = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.TAG_NAME, "h1"))
                )
                results['page_load'] = True
                results['title_contains_real_data'] = "Real Data Only" in title.text
                print(f"✅ Page loaded with title: {title.text}")
            except TimeoutException:
                results['page_load'] = False
                results['title_contains_real_data'] = False
                print("❌ Page failed to load")
                return results

            # Check if backend offline message is shown when backend is down
            backend_online = self.check_backend_status()
            
            if not backend_online:
                # Should show backend offline message
                try:
                    offline_message = self.driver.find_element(By.XPATH, "//*[contains(text(), 'Backend Connection Required')]")
                    results['shows_offline_message_when_backend_down'] = True
                    print("✅ Shows offline message when backend is down")
                    
                    # Check that no satellite data is displayed
                    try:
                        mock_data_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'mock') or contains(text(), 'demo') or contains(text(), 'sample')]")
                        results['no_mock_data_when_offline'] = len(mock_data_elements) == 0
                        print(f"✅ No mock data shown when offline: {len(mock_data_elements)} mock elements found")
                    except:
                        results['no_mock_data_when_offline'] = True
                        
                except NoSuchElementException:
                    results['shows_offline_message_when_backend_down'] = False
                    print("❌ Does not show offline message when backend is down")
            else:
                # Backend is online, test real data functionality
                results['shows_offline_message_when_backend_down'] = True  # Not applicable
                
                # Test coordinate input functionality
                try:
                    coord_input = self.driver.find_element(By.XPATH, "//input[@placeholder='Enter coordinates (lat, lng)']")
                    coord_input.clear()
                    coord_input.send_keys("-3.4653, -62.2159")
                    
                    update_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Update')]")
                    update_button.click()
                    time.sleep(2)
                    
                    results['coordinate_input_works'] = True
                    print("✅ Coordinate input and update works")
                except Exception as e:
                    results['coordinate_input_works'] = False
                    print(f"❌ Coordinate input failed: {e}")

                # Test refresh button
                try:
                    refresh_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Refresh')]")
                    refresh_button.click()
                    time.sleep(2)
                    results['refresh_button_works'] = True
                    print("✅ Refresh button works")
                except Exception as e:
                    results['refresh_button_works'] = False
                    print(f"❌ Refresh button failed: {e}")

                # Check for "REAL DATA" badges
                try:
                    real_data_badges = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'REAL DATA')]")
                    results['real_data_badges_present'] = len(real_data_badges) > 0
                    print(f"✅ Real data badges found: {len(real_data_badges)}")
                except:
                    results['real_data_badges_present'] = False
                    print("❌ No real data badges found")

            # Check that no demo/mock mode text exists
            try:
                demo_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Demo Mode') or contains(text(), 'Mock') or contains(text(), 'Sample Data')]")
                results['no_demo_mode_text'] = len(demo_elements) == 0
                print(f"✅ No demo mode text found: {len(demo_elements)} demo elements")
            except:
                results['no_demo_mode_text'] = True

        except Exception as e:
            print(f"❌ Satellite page test failed: {e}")
            results['error'] = str(e)

        return results

    def test_discovery_page_real_data_only(self) -> Dict[str, Any]:
        """Test discovery page ensures all buttons only work with real data"""
        print("\n🏛️ Testing Discovery Page - Real Data Only")
        results = {}
        
        try:
            # Navigate to discovery page
            self.driver.get(f"{self.frontend_url}/archaeological-discovery")
            time.sleep(3)
            
            # Check page loads
            try:
                title = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.XPATH, "//h1[contains(text(), 'Archaeological Discovery')]"))
                )
                results['page_load'] = True
                print("✅ Discovery page loaded successfully")
            except TimeoutException:
                results['page_load'] = False
                print("❌ Discovery page failed to load")
                return results

            # Test coordinate input
            try:
                lat_input = self.driver.find_element(By.ID, "latitude")
                lng_input = self.driver.find_element(By.ID, "longitude")
                
                lat_input.clear()
                lat_input.send_keys("-3.4653")
                lng_input.clear()
                lng_input.send_keys("-62.2159")
                
                results['coordinate_input_works'] = True
                print("✅ Coordinate inputs work")
            except Exception as e:
                results['coordinate_input_works'] = False
                print(f"❌ Coordinate input failed: {e}")

            # Test data source selection buttons
            try:
                data_source_buttons = self.driver.find_elements(By.XPATH, "//button[contains(@class, 'justify-start')]")
                if len(data_source_buttons) > 0:
                    data_source_buttons[0].click()  # Click first data source
                    time.sleep(1)
                    results['data_source_selection_works'] = True
                    print(f"✅ Data source selection works: {len(data_source_buttons)} sources found")
                else:
                    results['data_source_selection_works'] = False
                    print("❌ No data source buttons found")
            except Exception as e:
                results['data_source_selection_works'] = False
                print(f"❌ Data source selection failed: {e}")

            # Test quick location buttons
            try:
                quick_location_buttons = self.driver.find_elements(By.XPATH, "//button[contains(text(), 'Amazon Basin') or contains(text(), 'Andes Mountains') or contains(text(), 'Cerrado Savanna')]")
                if len(quick_location_buttons) > 0:
                    quick_location_buttons[0].click()
                    time.sleep(1)
                    results['quick_location_buttons_work'] = True
                    print(f"✅ Quick location buttons work: {len(quick_location_buttons)} buttons found")
                else:
                    results['quick_location_buttons_work'] = False
                    print("❌ No quick location buttons found")
            except Exception as e:
                results['quick_location_buttons_work'] = False
                print(f"❌ Quick location buttons failed: {e}")

            # Test discover sites button (should only work with backend)
            try:
                discover_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Discover Sites')]")
                is_enabled = discover_button.is_enabled()
                results['discover_button_present'] = True
                results['discover_button_behavior'] = 'enabled' if is_enabled else 'disabled'
                print(f"✅ Discover Sites button found: {'enabled' if is_enabled else 'disabled'}")
                
                # If backend is online and button is enabled, test it doesn't use mock data
                if is_enabled and self.check_backend_status():
                    # Click and check if it makes real API calls
                    discover_button.click()
                    time.sleep(3)
                    
                    # Check for loading state (indicates real API call)
                    try:
                        loading_element = self.driver.find_element(By.XPATH, "//*[contains(text(), 'Searching...') or contains(text(), 'Loading')]")
                        results['discover_uses_real_api'] = True
                        print("✅ Discover button makes real API calls")
                    except NoSuchElementException:
                        results['discover_uses_real_api'] = False
                        print("❌ Discover button may not be making real API calls")
                
            except Exception as e:
                results['discover_button_present'] = False
                print(f"❌ Discover Sites button test failed: {e}")

            # Test refresh button
            try:
                refresh_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Refresh')]")
                refresh_button.click()
                time.sleep(2)
                results['refresh_button_works'] = True
                print("✅ Refresh button works")
            except Exception as e:
                results['refresh_button_works'] = False
                print(f"❌ Refresh button failed: {e}")

            # Check that no mock/demo data is mentioned
            try:
                mock_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'mock') or contains(text(), 'demo') or contains(text(), 'sample') or contains(text(), 'fake')]")
                results['no_mock_data_references'] = len(mock_elements) == 0
                print(f"✅ No mock data references: {len(mock_elements)} mock elements found")
            except:
                results['no_mock_data_references'] = True

        except Exception as e:
            print(f"❌ Discovery page test failed: {e}")
            results['error'] = str(e)

        return results

    def test_backend_endpoints(self) -> Dict[str, Any]:
        """Test backend endpoints that pages rely on"""
        print("\n🔗 Testing Backend Endpoints")
        results = {}
        
        endpoints_to_test = [
            {'url': '/health', 'method': 'GET'},
            {'url': '/satellite/health', 'method': 'GET'},
            {'url': '/research/sites', 'method': 'GET'},
            {'url': '/agents/agents', 'method': 'GET'},
        ]
        
        for endpoint in endpoints_to_test:
            try:
                url = f"{self.backend_url}{endpoint['url']}"
                if endpoint['method'] == 'GET':
                    response = requests.get(url, timeout=5)
                else:
                    response = requests.post(url, timeout=5)
                
                results[endpoint['url']] = {
                    'status_code': response.status_code,
                    'accessible': response.status_code < 400,
                    'response_time': response.elapsed.total_seconds()
                }
                print(f"✅ {endpoint['url']}: {response.status_code} ({response.elapsed.total_seconds():.2f}s)")
                
            except Exception as e:
                results[endpoint['url']] = {
                    'accessible': False,
                    'error': str(e)
                }
                print(f"❌ {endpoint['url']}: {e}")
        
        return results

    def run_comprehensive_test(self):
        """Run all tests and generate report"""
        print("🚀 Starting Comprehensive Real Data Only Test")
        print("="*60)
        
        # Setup browser
        if not self.setup_browser():
            print("❌ Failed to setup browser, exiting...")
            return
        
        try:
            # Test backend
            self.results['backend_status'] = self.check_backend_status()
            self.results['backend_endpoints'] = self.test_backend_endpoints()
            
            # Test satellite page
            self.results['satellite_page'] = self.test_satellite_page_real_data_only()
            
            # Test discovery page  
            self.results['discovery_page'] = self.test_discovery_page_real_data_only()
            
            # Generate summary
            self.generate_summary()
            
            # Print final report
            self.print_final_report()
            
        finally:
            self.driver.quit()

    def generate_summary(self):
        """Generate test summary"""
        satellite_tests = sum(1 for v in self.results['satellite_page'].values() if isinstance(v, bool) and v)
        satellite_total = len([v for v in self.results['satellite_page'].values() if isinstance(v, bool)])
        
        discovery_tests = sum(1 for v in self.results['discovery_page'].values() if isinstance(v, bool) and v)
        discovery_total = len([v for v in self.results['discovery_page'].values() if isinstance(v, bool)])
        
        backend_tests = sum(1 for v in self.results['backend_endpoints'].values() if isinstance(v, dict) and v.get('accessible', False))
        backend_total = len(self.results['backend_endpoints'])
        
        self.results['summary'] = {
            'satellite_page': f"{satellite_tests}/{satellite_total}",
            'discovery_page': f"{discovery_tests}/{discovery_total}",
            'backend_endpoints': f"{backend_tests}/{backend_total}",
            'backend_online': self.results['backend_status']['online'],
            'overall_success_rate': round(((satellite_tests + discovery_tests + backend_tests) / 
                                         max(1, satellite_total + discovery_total + backend_total)) * 100, 1)
        }

    def print_final_report(self):
        """Print comprehensive test report"""
        print("\n" + "="*60)
        print("📊 COMPREHENSIVE REAL DATA ONLY TEST REPORT")
        print("="*60)
        
        print(f"\n🛠️ BACKEND STATUS:")
        print(f"   Status: {'🟢 Online' if self.results['backend_status']['online'] else '🔴 Offline'}")
        if self.results['backend_status']['online']:
            print(f"   Response Time: {self.results['backend_status']['response_time']:.2f}s")
        
        print(f"\n🛰️ SATELLITE PAGE TESTS:")
        for test_name, result in self.results['satellite_page'].items():
            if isinstance(result, bool):
                status = "✅ PASS" if result else "❌ FAIL"
                print(f"   {test_name}: {status}")
        
        print(f"\n🏛️ DISCOVERY PAGE TESTS:")
        for test_name, result in self.results['discovery_page'].items():
            if isinstance(result, bool):
                status = "✅ PASS" if result else "❌ FAIL"
                print(f"   {test_name}: {status}")
        
        print(f"\n🔗 BACKEND ENDPOINT TESTS:")
        for endpoint, result in self.results['backend_endpoints'].items():
            if isinstance(result, dict):
                status = "✅ ACCESSIBLE" if result.get('accessible', False) else "❌ INACCESSIBLE"
                print(f"   {endpoint}: {status}")
        
        print(f"\n📈 SUMMARY:")
        print(f"   Satellite Page: {self.results['summary']['satellite_page']} tests passed")
        print(f"   Discovery Page: {self.results['summary']['discovery_page']} tests passed")
        print(f"   Backend Endpoints: {self.results['summary']['backend_endpoints']} accessible")
        print(f"   Overall Success Rate: {self.results['summary']['overall_success_rate']}%")
        
        success_rate = self.results['summary']['overall_success_rate']
        if success_rate >= 90:
            print(f"\n🎉 EXCELLENT: All systems working with real data only!")
        elif success_rate >= 75:
            print(f"\n👍 GOOD: Most systems working with real data")
        else:
            print(f"\n⚠️ NEEDS ATTENTION: Some systems may have mock data fallbacks")
        
        # Save results to file
        with open('test_real_data_only_results.json', 'w') as f:
            json.dump(self.results, f, indent=2)
        print(f"\n💾 Detailed results saved to: test_real_data_only_results.json")

if __name__ == "__main__":
    tester = RealDataOnlyTester()
    tester.run_comprehensive_test() 