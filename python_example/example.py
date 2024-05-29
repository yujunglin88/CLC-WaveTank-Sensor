import serial

# Define the serial port and baud rate
serial_port = 'COM4'  # Change this to the appropriate port
baud_rate = 115200  # Change this to match your device's baud rate

# Create a serial object
ser = serial.Serial(serial_port, baud_rate)

try:
    while True:
        # Read a line from the serial port
        line = ser.readline().decode().strip()
        
        # Output the received line
        print(line)

except KeyboardInterrupt:
    # Close the serial port when Ctrl+C is pressed
    ser.close()
    print("Serial port closed.")