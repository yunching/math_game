from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import UnexpectedAlertPresentException, NoAlertPresentException
from webdriver_manager.chrome import ChromeDriverManager
import time
import socket
import subprocess
import unittest
import re
import os

# Function to check if server is already running on port 8080
def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

class MathGameTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Initialize the Chrome driver with additional options to fix rendering issues
        options = webdriver.ChromeOptions()
        options.add_argument('--headless=new')  # Use the new headless mode
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--window-size=1920,1080')  # Set a larger window size
        options.add_argument('--start-maximized')
        options.add_argument('--disable-gpu')  # Disable GPU acceleration which may cause issues
        cls.driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
        
        # Check if server is already running
        cls.server_process = None
        if not is_port_in_use(8080):
            print("Starting new server instance...")
            # Start the local server
            if os.name == "nt":
                cls.server_process = subprocess.Popen(['start-server.bat'], shell=True)
            else:
                cls.server_process = subprocess.Popen(['node', 'server.js'])
            time.sleep(5)  # Wait for the server to start
        else:
            print("Server already running on port 8080, proceeding with tests...")
    
    def setUp(self):
        # Open the HTML file at the beginning of each test
        file_path = "http://localhost:8080"
        self.driver.get(file_path)
        
        # Wait for the page to load
        time.sleep(2)
        
        # Dismiss any alerts that might be present
        self.dismiss_alert()
    
    def dismiss_alert(self):
        """Helper method to dismiss any alerts that might be present"""
        try:
            alert = self.driver.switch_to.alert
            alert.accept()
        except NoAlertPresentException:
            pass
    
    @classmethod
    def tearDownClass(cls):
        # Close the browser
        cls.driver.quit()
        # Stop the server only if we started it
        if cls.server_process:
            print("Terminating server process...")
            cls.server_process.terminate()
    
    def open_settings(self):
        """Helper method to open settings panel"""
        # Test if the settings icon is present and clickable
        settings_icon = self.driver.find_element(By.CLASS_NAME, "settings-icon")
        
        # Add a short pause before clicking to ensure the page is stable
        time.sleep(1)
        settings_icon.click()
        
        # Wait for settings to be visible
        time.sleep(1)
    
    def close_settings(self):
        """Helper method to close settings panel"""
        # Find and click the save button
        save_button = self.driver.find_element(By.XPATH, "//button[text()='Save']")
        save_button.click()
        time.sleep(1)  # Wait for settings to close
    
    def submit_answer(self, answer):
        """Helper method to submit an answer and handle any alerts"""
        answer_input = self.driver.find_element(By.ID, "answer")
        answer_input.clear()
        answer_input.send_keys(str(answer))
        answer_input.send_keys(Keys.RETURN)
        
        # Handle alert if present
        self.dismiss_alert()
        time.sleep(0.5)
    
    def test_title(self):
        """Test if the title is correct"""
        self.assertIn("Quick Math Game", self.driver.title)
    
    def test_settings_panel(self):
        """Test if settings panel opens and contains expected elements"""
        self.open_settings()
        
        # Verify settings are visible
        settings_element = self.driver.find_element(By.ID, "settings")
        self.assertTrue(settings_element.is_displayed())
        
        # Test if the addition checkbox exists
        addition_checkbox = self.driver.find_element(By.ID, "addition")
        self.assertIsNotNone(addition_checkbox)
        
        self.close_settings()
    
    def test_fixed_number_inputs_exist(self):
        """Test that fixed number inputs exist for all operations"""
        self.open_settings()
        
        # Check that all fixed number inputs exist
        operations = ["addition", "subtraction", "multiplication", "division"]
        for op in operations:
            fixed_input = self.driver.find_element(By.ID, f"{op}Fixed")
            self.assertIsNotNone(fixed_input)
            self.assertEqual(fixed_input.get_attribute("type"), "number")
            # Don't check the value as it might have been changed by other tests
        
        self.close_settings()
    
    def test_fixed_number_tooltips(self):
        """Test that tooltips are present and contain expected text"""
        self.open_settings()
        
        # Check the header tooltip
        fixed_header = self.driver.find_element(By.XPATH, "//div[@class='settings-header']/span[contains(@title, 'fixed')]")
        tooltip_text = fixed_header.get_attribute("title")
        self.assertIn("times table", tooltip_text.lower())
        
        # Check operation-specific tooltips
        operations = {
            "addition": "addition problems",
            "subtraction": "subtraction problems",
            "multiplication": "times tables",
            "division": "division problems"
        }
        
        for op, expected_text in operations.items():
            fixed_input = self.driver.find_element(By.ID, f"{op}Fixed")
            tooltip_text = fixed_input.get_attribute("title")
            self.assertIn(expected_text.lower(), tooltip_text.lower())
        
        self.close_settings()
    
    def test_multiplication_fixed_number(self):
        """Test that setting a fixed number for multiplication works correctly"""
        self.open_settings()
        
        # Enable only multiplication
        for op in ["addition", "subtraction", "division"]:
            checkbox = self.driver.find_element(By.ID, op)
            if checkbox.is_selected():
                checkbox.click()
        
        mult_checkbox = self.driver.find_element(By.ID, "multiplication")
        if not mult_checkbox.is_selected():
            mult_checkbox.click()
        
        # Set fixed number for multiplication to 7
        fixed_input = self.driver.find_element(By.ID, "multiplicationFixed")
        fixed_input.clear()
        fixed_input.send_keys("7")
        
        self.close_settings()
        
        # Start the game (it should auto-start after saving settings)
        time.sleep(1)
        
        # Check first question to ensure it uses the fixed number
        try:
            question_element = self.driver.find_element(By.ID, "question")
            question_text = question_element.text
            
            # Extract numbers from the question using regex
            match = re.search(r'What is (\d+) x (\d+)\?', question_text)
            if match:
                num1 = int(match.group(1))
                self.assertEqual(num1, 7, f"Expected first number to be 7, but got {num1}")
                
                # Submit a correct answer to avoid alerts
                num2 = int(match.group(2))
                correct_answer = num1 * num2
                self.submit_answer(correct_answer)
        except UnexpectedAlertPresentException:
            self.dismiss_alert()
    
    def test_addition_fixed_number(self):
        """Test that setting a fixed number for addition works correctly"""
        self.open_settings()
        
        # Enable only addition
        for op in ["multiplication", "subtraction", "division"]:
            checkbox = self.driver.find_element(By.ID, op)
            if checkbox.is_selected():
                checkbox.click()
        
        add_checkbox = self.driver.find_element(By.ID, "addition")
        if not add_checkbox.is_selected():
            add_checkbox.click()
        
        # Set fixed number for addition to 5
        fixed_input = self.driver.find_element(By.ID, "additionFixed")
        fixed_input.clear()
        fixed_input.send_keys("5")
        
        self.close_settings()
        
        # Start the game
        time.sleep(1)
        
        # Check first question to ensure it uses the fixed number
        try:
            question_element = self.driver.find_element(By.ID, "question")
            question_text = question_element.text
            
            # Extract numbers from the question using regex
            match = re.search(r'What is (\d+) \+ (\d+)\?', question_text)
            if match:
                num1 = int(match.group(1))
                self.assertEqual(num1, 5, f"Expected first number to be 5, but got {num1}")
                
                # Submit a correct answer to avoid alerts
                num2 = int(match.group(2))
                correct_answer = num1 + num2
                self.submit_answer(correct_answer)
        except UnexpectedAlertPresentException:
            self.dismiss_alert()

    def test_multiplication_fixed_number_with_larger_first(self):
        """Test that Larger Number First works correctly with fixed number for multiplication"""
        self.open_settings()
        
        # Enable only multiplication
        for op in ["addition", "subtraction", "division"]:
            checkbox = self.driver.find_element(By.ID, op)
            if checkbox.is_selected():
                checkbox.click()
        
        mult_checkbox = self.driver.find_element(By.ID, "multiplication")
        if not mult_checkbox.is_selected():
            mult_checkbox.click()
        
        # Set fixed number for multiplication to 3
        fixed_input = self.driver.find_element(By.ID, "multiplicationFixed")
        fixed_input.clear()
        fixed_input.send_keys("3")
        
        # Check that Larger Number First is automatically unchecked
        larger_first_checkbox = self.driver.find_element(By.ID, "multiplicationLargerFirst")
        self.assertFalse(larger_first_checkbox.is_selected(), 
                         "Larger Number First should be unchecked when fixed number is set")
        
        # Now manually check Larger Number First
        larger_first_checkbox.click()
        
        self.close_settings()
        
        # Start the game
        time.sleep(1)
        
        # Check first question to ensure it respects Larger Number First
        try:
            question_element = self.driver.find_element(By.ID, "question")
            question_text = question_element.text
            
            # Extract numbers from the question using regex
            match = re.search(r'What is (\d+) x (\d+)\?', question_text)
            if match:
                num1 = int(match.group(1))
                num2 = int(match.group(2))
                
                # With Larger Number First checked, the first number should be the larger one
                # Since we set fixed number to 3, the second number should be 3 if it's smaller than the first
                self.assertGreaterEqual(num1, num2, 
                                      f"First number {num1} should be greater than or equal to second number {num2}")
                
                if num1 > 3:
                    self.assertEqual(num2, 3, 
                                   f"When first number {num1} is larger, second number should be the fixed number 3")
                
                # Submit a correct answer to avoid alerts
                correct_answer = num1 * num2
                self.submit_answer(correct_answer)
        except UnexpectedAlertPresentException:
            self.dismiss_alert()

if __name__ == "__main__":
    unittest.main()
