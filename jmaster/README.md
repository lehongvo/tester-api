# JMeter Setup and Usage Guide

## Prerequisites

This directory contains a complete JMeter setup with:
- OpenJDK 21.0.2 (macOS aarch64)
- Apache JMeter 5.6.3

## How to Run JMeter

### Launch JMeter GUI

To start JMeter with the graphical user interface:

```bash
./index.sh
```

### Check JMeter Version

To verify the installation and check the version:

```bash
./index.sh --version
```

### Run JMeter in Non-GUI Mode

To run a test plan in non-GUI mode (recommended for actual testing):

```bash
./index.sh -n -t /path/to/testplan.jmx -l /path/to/results.jtl
```

**Common Options:**
- `-n` - Non-GUI mode
- `-t` - Test plan file
- `-l` - Log file for results
- `-j` - JMeter log file
- `-r` - Run on remote servers

### Example: Running a Test Plan

```bash
./index.sh -n -t my_test.jmx -l results.jtl -j jmeter.log
```

## Directory Structure

```
jmaster/
├── index.sh                    # Launch script
├── jdk-21.0.2.jdk/            # OpenJDK 21.0.2
├── apache-jmeter-5.6.3/       # JMeter installation
└── README.md                   # This file
```

## Troubleshooting

### Permission Denied

If you get a permission denied error, make the script executable:

```bash
chmod +x index.sh
```

### Java Not Found

The script automatically sets `JAVA_HOME` to the bundled JDK. If you encounter Java-related errors, verify that the `jdk-21.0.2.jdk` directory exists.

## Additional Resources

- [JMeter Documentation](https://jmeter.apache.org/usermanual/index.html)
- [JMeter Best Practices](https://jmeter.apache.org/usermanual/best-practices.html)
