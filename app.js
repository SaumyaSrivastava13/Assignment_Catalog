const fs = require('fs');

// Function to decode value based on its base
function decodeValue(base, value) {
    return parseInt(value, base);
}

// Function to read the test case from a JSON file
function readTestCase(filename) {
    const data = fs.readFileSync(filename, 'utf-8');
    const json = JSON.parse(data);

    const points = [];
    for (const key in json) {
        if (!isNaN(key)) {
            const base = parseInt(json[key].base);
            const value = json[key].value;
            const x = parseInt(key);
            const y = decodeValue(base, value);
            points.push([x, y]);
        }
    }
    return points;
}

// Function to perform Lagrange interpolation to find the constant term (secret)
function lagrangeInterpolation(points) {
    const x_vals = points.map(p => p[0]);
    const y_vals = points.map(p => p[1]);
    const k = points.length;

    function basisPolynomial(i) {
        let p = [1]; // Polynomial represented as an array of coefficients.
        for (let j = 0; j < k; j++) {
            if (i !== j) {
                p = multiplyPolynomials(p, [-x_vals[j], 1]);
                p = scalePolynomial(p, 1 / (x_vals[i] - x_vals[j]));
            }
        }
        return p;
    }

    function multiplyPolynomials(a, b) {
        const result = new Array(a.length + b.length - 1).fill(0);
        for (let i = 0; i < a.length; i++) {
            for (let j = 0; j < b.length; j++) {
                result[i + j] += a[i] * b[j];
            }
        }
        return result;
    }

    function scalePolynomial(p, factor) {
        return p.map(coefficient => coefficient * factor);
    }

    // Compute the full polynomial as the sum of y_i * L_i(x)
    let polynomial = [0];
    for (let i = 0; i < k; i++) {
        const term = scalePolynomial(basisPolynomial(i), y_vals[i]);
        polynomial = polynomial.map((val, index) => (val || 0) + (term[index] || 0));
    }

    // Return the constant term (which is the secret)
    return polynomial[0];
}

// Read the test case from a JSON file and find the secret
function solve(filename) {
    const points = readTestCase(filename);
    const secret = lagrangeInterpolation(points);
    console.log(`Secret: ${secret}`);
}

// Test case 1
solve('testcase1.json');

// Test case 2
solve('testcase2.json');