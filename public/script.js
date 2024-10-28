async function fetchData() {
    const response = await fetch('http://localhost:3000/api/telemetria');
    const data = await response.json();
    return data;
}

function createGauge(id, title, value, max) {
    new JustGage({
        id: id,
        value: value,
        min: 0,
        max: max,
        title: title,
        label: " ",
        gaugeWidthScale: 0.6,
        pointer: true,
        pointerOptions: {
            toplength: 8,
            bottomlength: -20,
            bottomwidth: 6,
            color: '#000'
        },
        customSectors: [{
            color: "#ff0000",
            lo: 35,
            hi: 50
        }, {
            color: "#ffcc00",
            lo: 15,
            hi: 35
        }, {
            color: "#00ff00",
            lo: 0,
            hi: 15
        }],
        counter: true
    });
}

function createLineChart(ctx, labels, data, label, color) {
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: color,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

async function initDashboard() {
    const data = await fetchData();
    const timestamps = data.map(item => item.timestamp);

    // Dados por ambiente e caixas
    const ambientes = {
        "Ambiente": { temp: [], humidity: [], pressure: [] },
        "Caixa 9": { temp: [], humidity: [], pressure: [] },
        "Caixa 10": { temp: [], humidity: [], pressure: [] },
        "Caixa 12": { temp: [], humidity: [], pressure: [] }
    };

    data.forEach(item => {
        if (item.location in ambientes) {
            ambientes[item.location].temp.push(item.temperatura);
            ambientes[item.location].humidity.push(item.umidade);
            ambientes[item.location].pressure.push(item.pressao);
        }
    });

    // Ambiente
    createGauge('tempGaugeAmb', 'Temperatura (°C)', ambientes["Ambiente"].temp.slice(-1)[0], 50);
    createGauge('humidityGaugeAmb', 'Umidade (%)', ambientes["Ambiente"].humidity.slice(-1)[0], 100);
    createGauge('pressureGaugeAmb', 'Pressão (hPa)', ambientes["Ambiente"].pressure.slice(-1)[0], 1100);
    createLineChart(document.getElementById('tempChartAmb'), timestamps, ambientes["Ambiente"].temp, 'Temperatura', 'red');
    createLineChart(document.getElementById('humidityChartAmb'), timestamps, ambientes["Ambiente"].humidity, 'Umidade', 'blue');
    createLineChart(document.getElementById('pressureChartAmb'), timestamps, ambientes["Ambiente"].pressure, 'Pressão', 'green');

    // Caixa 9
    createGauge('tempGaugeC9', 'Temperatura (°C)', ambientes["Caixa 9"].temp.slice(-1)[0], 50);
    createGauge('humidityGaugeC9', 'Umidade (%)', ambientes["Caixa 9"].humidity.slice(-1)[0], 100);
    createGauge('pressureGaugeC9', 'Pressão (hPa)', ambientes["Caixa 9"].pressure.slice(-1)[0], 1100);
    createLineChart(document.getElementById('tempChartC9'), timestamps, ambientes["Caixa 9"].temp, 'Temperatura', 'red');
    createLineChart(document.getElementById('humidityChartC9'), timestamps, ambientes["Caixa 9"].humidity, 'Umidade', 'blue');
    createLineChart(document.getElementById('pressureChartC9'), timestamps, ambientes["Caixa 9"].pressure, 'Pressão', 'green');

    // Caixa 10
    createGauge('tempGaugeC10', 'Temperatura (°C)', ambientes["Caixa 10"].temp.slice(-1)[0], 50);
    createGauge('humidityGaugeC10', 'Umidade (%)', ambientes["Caixa 10"].humidity.slice(-1)[0], 100);
    createGauge('pressureGaugeC10', 'Pressão (hPa)', ambientes["Caixa 10"].pressure.slice(-1)[0], 1100);
    createLineChart(document.getElementById('tempChartC10'), timestamps, ambientes["Caixa 10"].temp, 'Temperatura', 'red');
    createLineChart(document.getElementById('humidityChartC10'), timestamps, ambientes["Caixa 10"].humidity, 'Umidade', 'blue');
    createLineChart(document.getElementById('pressureChartC10'), timestamps, ambientes["Caixa 10"].pressure, 'Pressão', 'green');

    // Caixa 12
    createGauge('tempGaugeC12', 'Temperatura (°C)', ambientes["Caixa 12"].temp.slice(-1)[0], 50);
    createGauge('humidityGaugeC12', 'Umidade (%)', ambientes["Caixa 12"].humidity.slice(-1)[0], 100);
    createGauge('pressureGaugeC12', 'Pressão (hPa)', ambientes["Caixa 12"].pressure.slice(-1)[0], 1100);
    createLineChart(document.getElementById('tempChartC12'), timestamps, ambientes["Caixa 12"].temp, 'Temperatura', 'red');
    createLineChart(document.getElementById('humidityChartC12'), timestamps, ambientes["Caixa 12"].humidity, 'Umidade', 'blue');
    createLineChart(document.getElementById('pressureChartC12'), timestamps, ambientes["Caixa 12"].pressure, 'Pressão', 'green');
}

initDashboard();
