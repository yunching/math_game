from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time
import socket
import subprocess

# Function to check if server is already running on port 8080
def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

# Initialize the Chrome driver with additional options to fix rendering issues
options = webdriver.ChromeOptions()
options.add_argument('--headless=new')  # Use the new headless mode
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument('--window-size=1920,1080')  # Set a larger window size
options.add_argument('--start-maximized')
options.add_argument('--disable-gpu')  # Disable GPU acceleration which may cause issues
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

server_process = None
try:
    # Check if server is already running
    if not is_port_in_use(8080):
        print("Starting new server instance...")
        # Start the local server
        server_process = subprocess.Popen(['start-server.bat'], shell=True)
        time.sleep(5)  # Wait for the server to start
    else:
        print("Server already running on port 8080, proceeding with tests...")

    # Open the HTML file
    file_path = "http://localhost:8080"
    driver.get(file_path)

    # Wait for the page to load
    time.sleep(2)

    # Test if the title is correct
    assert "Quick Math Game" in driver.title, f"Expected 'Quick Math Game' in title, but got '{driver.title}'"

    # Test if the settings icon is present and clickable
    settings_icon = driver.find_element(By.CLASS_NAME, "settings-icon")
    
    # Add a short pause before clicking to ensure the page is stable
    time.sleep(1)
    settings_icon.click()
    
    # Create a more robust wait condition using the new 'visible' class
    wait = WebDriverWait(driver, 10)
    
    # Wait for the 'visible' class to be added to the settings element
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "#settings.visible")))
    
    # Now verify the settings panel is displayed
    settings_element = driver.find_element(By.ID, "settings")
    assert 'visible' in settings_element.get_attribute("class"), "Settings panel is not displayed"
    
    # Test if the addition checkbox is checked
    addition_checkbox = driver.find_element(By.ID, "addition")
    assert addition_checkbox.is_selected()

    # Test if the save button works
    save_button = driver.find_element(By.XPATH, "//button[text()='Save']")
    save_button.click()
    
    print("Tests completed successfully!")
    # Add more tests as needed
    # ...

finally:
    # Close the browser
    driver.quit()
    # Stop the server only if we started it
    if server_process:
        print("Terminating server process...")
        server_process.terminate()