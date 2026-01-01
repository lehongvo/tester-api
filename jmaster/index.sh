#!/bin/bash

# Define paths relative to the script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Script location: $SCRIPT_DIR"

# Set JAVA_HOME to the downloaded JDK
export JAVA_HOME="$SCRIPT_DIR/jdk-21.0.2.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

echo "Using JAVA_HOME: $JAVA_HOME"
java -version

# Launch JMeter
JMETER_BIN="$SCRIPT_DIR/apache-jmeter-5.6.3/bin/jmeter"
echo "Launching JMeter from: $JMETER_BIN"

exec "$JMETER_BIN" "$@"
