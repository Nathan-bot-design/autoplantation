from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
import numpy as np
from sklearn.linear_model import LinearRegression

app = Flask(__name__)
CORS(app)

# MySQL Database Configuration
DB_CONFIG = {
    'host': 'localhost',  # Update if necessary
    'user': 'root',       # Replace with your username
    'password': 'magicD53@',       # Replace with your password
    'database': 'waterleakagemonitoringdb'
}

def fetch_sensor_data(sensor_type):
    connection = mysql.connector.connect(**DB_CONFIG)
    cursor = connection.cursor(dictionary=True)

    query = """
    SELECT s.sensor_name, sr.timestamp, sr.value
    FROM sensorreadings sr
    INNER JOIN sensors s ON sr.sensor_id = s.sensor_id
    WHERE s.sensor_type = %s
    ORDER BY sr.timestamp
    """
    cursor.execute(query, (sensor_type,))
    result = cursor.fetchall()

    cursor.close()
    connection.close()

    return result


def predict_next_value(values):
    """Predict the next value using Linear Regression."""
    if len(values) < 2:  # Avoid errors if not enough data for ML
        return values[-1] if values else 0
    X = np.array(range(len(values))).reshape(-1, 1)
    y = np.array(values).reshape(-1, 1)
    model = LinearRegression()
    model.fit(X, y)
    prediction = model.predict([[len(values)]])[0][0]
    return round(prediction, 2)

# Root route
@app.route('/')
def index():
    return jsonify({'message': 'Water Leakage Monitoring API is running.'})

# Fetch Leakage Data
@app.route('/analytics/Leakage', methods=['GET'])
def leakage_data():
    data = fetch_sensor_data("Leakage")

    # Get all unique timestamps
    timestamps = sorted({row['timestamp'].strftime('%Y-%m-%d %H:%M:%S') for row in data})
    leakage1 = [0] * len(timestamps)
    leakage2 = [0] * len(timestamps)

    # Map data into leakage1 and leakage2 arrays based on timestamps
    timestamp_index = {ts: idx for idx, ts in enumerate(timestamps)}
    for row in data:
        index = timestamp_index[row['timestamp'].strftime('%Y-%m-%d %H:%M:%S')]
        if row['sensor_name'] == 'Leakage Sensor 1':
            leakage1[index] = row['value']
        elif row['sensor_name'] == 'Leakage Sensor 2':
            leakage2[index] = row['value']

    response = {
        "timestamps": timestamps,
        "values1": leakage1,
        "values2": leakage2,
        "statistics": {
            "total_events": len(data),
            "average_leakage1": round(sum(leakage1) / max(len(leakage1), 1), 2),
            "average_leakage2": round(sum(leakage2) / max(len(leakage2), 1), 2),
            "max_leakage1": max(leakage1, default=0),
            "max_leakage2": max(leakage2, default=0),
        },
        "predictions": {
            "leakage1": predict_next_value(leakage1),
            "leakage2": predict_next_value(leakage2),
        },
    }
    return jsonify(response)


@app.route('/analytics/FlowRate', methods=['GET'])
def flow_rate_data():
    data = fetch_sensor_data("FlowRate")
    if not data:
        return jsonify({
            "message": "No data available for flow rate sensors.",
            "predictions": {"flowrate1": 0, "flowrate2": 0},
            "statistics": {},
        })

    # Get all unique timestamps
    timestamps = sorted({row['timestamp'].strftime('%Y-%m-%d %H:%M:%S') for row in data})
    flowrate1 = [0] * len(timestamps)
    flowrate2 = [0] * len(timestamps)

    # Map data into flowrate1 and flowrate2 arrays based on timestamps
    timestamp_index = {ts: idx for idx, ts in enumerate(timestamps)}
    for row in data:
        index = timestamp_index[row['timestamp'].strftime('%Y-%m-%d %H:%M:%S')]
        if row['sensor_name'] == 'Flow Sensor 1':
            flowrate1[index] = row['value']
        elif row['sensor_name'] == 'Flow Sensor 2':
            flowrate2[index] = row['value']

    # Replace zeros with the average of non-zero values for better predictions
    def clean_data(values):
        non_zero_values = [v for v in values if v > 0]
        avg = sum(non_zero_values) / len(non_zero_values) if non_zero_values else 0
        return [v if v > 0 else avg for v in values]

    flowrate1 = clean_data(flowrate1)
    flowrate2 = clean_data(flowrate2)

    response = {
        "timestamps": timestamps,
        "values1": flowrate1,
        "values2": flowrate2,
        "statistics": {
            "total_events": len(data),
            "average_flowrate1": round(sum(flowrate1) / max(len(flowrate1), 1), 2),
            "average_flowrate2": round(sum(flowrate2) / max(len(flowrate2), 1), 2),
            "max_flowrate1": max(flowrate1, default=0),
            "max_flowrate2": max(flowrate2, default=0),
        },
        "predictions": {
            "flowrate1": predict_next_value(flowrate1),
            "flowrate2": predict_next_value(flowrate2),
        },
    }
    return jsonify(response)


# Update Sensor Data (Optional: API to dynamically insert test data)
@app.route('/api/update', methods=['POST'])
def update_sensor():
    data = request.json
    query = """
    INSERT INTO sensorreadings (sensor_id, value, timestamp)
    VALUES (%s, %s, NOW())
    """
    params = (data.get('sensor_id'), data.get('value'))
    connection = mysql.connector.connect(**DB_CONFIG)
    cursor = connection.cursor()
    cursor.execute(query, params)
    connection.commit()
    cursor.close()
    connection.close()
    return jsonify({'message': 'Sensor data updated successfully!'})

if __name__ == '__main__':
    app.run(debug=True)
