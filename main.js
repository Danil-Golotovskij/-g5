const DEFAULT_IMG_URL = "https://avatars.dzeninfra.ru/get-zen_doc/1244179/pub_62e41a4477aa332473c65a72_62e41d0877aa332473c9ed2f/scale_1200";
const DEFAULT_HIST_MAX = 10000;

const canvas = document.getElementById("canvas");
const context = canvas.getContext('2d');

function drawBrightnessHistogram(chart) {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const dict = Array(256).fill(0);

    for (let i = 0; i < data.length; i += 4) {
        const brightness = Math.round(
            0.299 * data[i] + 0.5876 * data[i + 1] + 0.114 * data[i + 2]
        );
        dict[brightness] += 1;
    }

    chart.config.data.datasets[0].data = dict;
    chart.update();
}

function invert() {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];         // R
        data[i + 1] = 255 - data[i + 1]; // G
        data[i + 2] = 255 - data[i + 2]; // B
    }

    context.putImageData(imageData, 0, 0);
}

function grayscale() {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;      // R
        data[i + 1] = avg;  // G
        data[i + 2] = avg;  // B
    }

    context.putImageData(imageData, 0, 0);
}

function brightnessAdjustment(coefficent) {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        data[i] += coefficent;        // R
        data[i + 1] += coefficent;    // G
        data[i + 2] += coefficent;    // B

        data[i] = Math.min(Math.max(data[i], 0), 255);
        data[i + 1] = Math.min(Math.max(data[i + 1], 0), 255);
        data[i + 2] = Math.min(Math.max(data[i + 2], 0), 255);
    }

    context.putImageData(imageData, 0, 0);
}

function contrastAdjustment(coefficent) {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let averageGray = 0;

    for (let i = 0; i < data.length; i += 4) {
        averageGray += (
            data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722
        );
    }

    averageGray /= data.length / 4;
    
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.round(
            coefficent * (data[i] - averageGray) + averageGray
        );    
        data[i + 1] = Math.round(
            coefficent * (data[i + 1] - averageGray) + averageGray
        );   
        data[i + 2] = Math.round(
            coefficent * (data[i + 2] - averageGray) + averageGray
        ); 

        data[i] = Math.min(Math.max(data[i], 0), 255);
        data[i + 1] = Math.min(Math.max(data[i + 1], 0), 255);
        data[i + 2] = Math.min(Math.max(data[i + 2], 0), 255);
    }

    context.putImageData(imageData, 0, 0);
}

function binarization(threshold) {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const total = data[i] + data[i + 1] + data[i + 2];

        if (total > threshold) {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
        } else {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
        }
    }

    context.putImageData(imageData, 0, 0);
}

function loadDefaultImage(chart) {
    const image = new Image();

    image.onload = function () {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
        drawBrightnessHistogram(chart);
    };

    image.src = DEFAULT_IMG_URL;
    image.crossOrigin = "Anonymous";
}

function main() {
    const ctx = document.getElementById('chart');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Array.from(Array(256).keys()),
            datasets: [{
                barPercentage: 0.5,
                barThickness: 6,
                maxBarThickness: 8,
                minBarLength: 2,
                data: Array(256).fill(0),
                backgroundColor: "rgba(124, 77, 255, 1)",
            }],
        },
        options: {
            responsive: true,
            title: {
                display: true,
                fontSize: 16,
                text: "Гистограмма"
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
        }
    });

    loadDefaultImage(chart);

    const grayscaleButton = document.getElementById("grayscaleButton");
    grayscaleButton.addEventListener("click", () => {
        grayscale();
        drawBrightnessHistogram(chart);
    });

    const invertButton = document.getElementById("invertButton");
    invertButton.addEventListener("click", () => {
        invert();
        drawBrightnessHistogram(chart);
    });

    const brightnessInput = document.getElementById("brightnessInput");
    const brightnessButton = document.getElementById("brightnessButton");
    brightnessButton.addEventListener("click", () => {
        const coefficient = parseInt(brightnessInput.value);
        brightnessAdjustment(coefficient);
        drawBrightnessHistogram(chart);
    });

    const contrastInput = document.getElementById("contrastInput");
    const contrastButton = document.getElementById("contrastButton");
    contrastButton.addEventListener("click", () => {
        const coefficient = parseFloat(eval(contrastInput.value));
        contrastAdjustment(coefficient);
        drawBrightnessHistogram(chart);
    });

    const binarizationInput = document.getElementById("binarizationInput");
    const binarizationButton = document.getElementById("binarizationButton");
    binarizationButton.addEventListener("click", () => {
        const threshold = parseInt(binarizationInput.value);
        binarization(threshold);
        drawBrightnessHistogram(chart);
    });
}

main();
