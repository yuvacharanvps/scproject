// 1. GLOBAL STATE MANAGEMENT
const appData = {
    budget: 0,
    transactions: [],
    accounts: [],
    goals: [],
    charts: {
        expenseBar: null,
        expenseRadial: null,
        sipLineChart: null
    },
    ui: {
        currentView: 'landing',
        isMobile: window.innerWidth <= 768
    }
};

// 2. UTILITY & HELPER FUNCTIONS
const formatINR = (num) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(num);
};

const sel = (id) => document.getElementById(id);

const generateUUID = () => {
    return 'tx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const getCategoryIcon = (cat) => {
    const icons = {
        Housing: '🏠',
        Food: '🍔',
        Transport: '🚗',
        Shopping: '🛍️',
        Utilities: '⚡',
        Other: '📌'
    };
    return icons[cat] || '📌';
};

// 3. THREE.JS 3D CINEMATIC LAUNCH ENGINE
let scene, camera, renderer, particles, animationId;

function initThreeJS() {
    const container = sel('three-container');
    if (!container) return;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030407, 0.001);

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
    );
    camera.position.z = 1000;

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x030407, 1);

    container.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const particleCount = 15000;

    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x00E5FF);
    const color2 = new THREE.Color(0x7C3AED);

    for (let i = 0; i < particleCount * 3; i += 3) {
        const radius = 800 + Math.random() * 1200;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos((Math.random() * 2) - 1);

        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);

        const mixedColor = color1.clone().lerp(color2, Math.random());

        colors[i] = mixedColor.r;
        colors[i + 1] = mixedColor.g;
        colors[i + 2] = mixedColor.b;
    }

    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
    );

    geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(colors, 3)
    );

    const material = new THREE.PointsMaterial({
        size: 3,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    window.addEventListener('resize', onWindowResize, false);

    animateThreeJS();
    triggerLaunchSequence();
}

function animateThreeJS() {
    animationId = requestAnimationFrame(animateThreeJS);

    if (particles) {
        particles.rotation.y += 0.002;
        particles.rotation.x += 0.001;
    }

    if (camera.position.z > 400) {
        camera.position.z -= 4;
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function triggerLaunchSequence() {
    setTimeout(() => {
        sel('view-landing').classList.remove('hidden');
        sel('view-landing').style.opacity = '0';
        sel('view-landing').style.transition = 'opacity 1s ease';

        void sel('view-landing').offsetWidth;
        sel('view-landing').style.opacity = '1';
    }, 4000);
}

function destroyThreeJS() {
    if (animationId) cancelAnimationFrame(animationId);

    const container = sel('three-container');

    if (container) {
        container.style.opacity = '0';

        setTimeout(() => {
            container.remove();
            sel('global-bg').classList.remove('hidden');
        }, 1500);
    }
}
// THIS IS BACKEND;

// 4. SIDEBAR ROUTING LOGIC
document.querySelectorAll('.nav-links li').forEach(l => {
    l.onclick = () => {
        document.querySelectorAll('.nav-links li').forEach(x =>
            x.classList.remove('active')
        );

        l.classList.add('active');

        document.querySelectorAll('.app-view').forEach(v => {
            v.style.opacity = '0';
            setTimeout(() => v.classList.remove('active'), 250);
        });

        setTimeout(() => {
            const targetView = sel(`view-${l.dataset.view}`);

            if (targetView) {
                targetView.classList.add('active');
                targetView.style.opacity = '1';

                if (
                    l.dataset.view === 'analytics' ||
                    l.dataset.view === 'investments'
                ) {
                    renderCharts();
                }
            }
        }, 250);
    };
});

// Initialize Widget Event Listeners
initWidgetListeners();

// 5. WIDGET EVENT BINDINGS
function initWidgetListeners() {

    // --- 1. Quick Interest Calculator ---
    const calcInt = () => {
        const p = +sel('calc-p').value;
        const r = +sel('calc-r').value;
        const t = +sel('calc-t').value;
        const res = sel('calc-res');

        if (p > 0 && r > 0 && t > 0) {
            const int = (p * r * t) / 100;

            res.innerHTML =
                `Yield: ${formatINR(int)}<br>` +
                `Maturity Value: ${formatINR(p + int)}`;

            res.classList.remove('hidden');
        } else {
            res.classList.add('hidden');
        }
    };

    ['calc-p', 'calc-r', 'calc-t'].forEach(id =>
        sel(id).addEventListener('input', calcInt)
    );

    // --- 2. Transaction Engine ---
    sel('btn-add-txn').onclick = () => {
        const title =
            sel('new-txn-title').value.trim() ||
            'Uncategorized Debit';

        const amount = +sel('new-txn-amount').value;
        const cat = sel('new-txn-cat').value;
        let date = sel('new-txn-date').value;

        if (!date) {
            date = new Date().toISOString().split('T')[0];
        }

        if (amount > 0) {
            appData.transactions.push({
                id: generateUUID(),
                date,
                title,
                category: cat,
                amount
            });

            appData.transactions.sort((a, b) =>
                b.date.localeCompare(a.date)
            );

            sel('new-txn-title').value = '';
            sel('new-txn-amount').value = '';
            sel('new-txn-date').value = '';

            sel('new-txn-title').focus();

            renderApp();
        } else {
            alert(
                'SYSTEM HALT: Transaction amount must be greater than zero.'
            );
        }
    };

    // View all shortcut
    sel('view-all-txns').onclick = () => {
        document
            .querySelector('.nav-links li[data-view="transactions"]')
            .click();
    };

    // --- 3. Accounts Manager ---
    sel('btn-add-acc').onclick = () => {
        const name = sel('new-acc-name').value.trim();
        const bal = +sel('new-acc-bal').value;

        if (
            name &&
            bal >= 0 &&
            sel('new-acc-bal').value !== ''
        ) {
            appData.accounts.push({
                id: generateUUID(),
                name,
                balance: bal
            });

            sel('new-acc-name').value = '';
            sel('new-acc-bal').value = '';

            renderApp();
        } else {
            alert('SYSTEM HALT: Invalid Asset parameters.');
        }
    };

    // --- 4. EMI Calculator ---
    const calcEMI = () => {
        const p = +sel('emi-p').value;
        const rAnnual = +sel('emi-r').value;
        const n = +sel('emi-t').value;

        const res = sel('emi-res');
        const sched = sel('emi-schedule');

        if (p > 0 && rAnnual > 0 && n > 0) {
            const r = rAnnual / 12 / 100;

            const emi =
                (p * r * Math.pow(1 + r, n)) /
                (Math.pow(1 + r, n) - 1);

            const totalPayment = emi * n;
            const totalInterest = totalPayment - p;

            res.innerHTML =
                `Monthly Installment:<br>` +
                `<span style="font-size:2.5rem">${formatINR(emi)}</span>`;

            res.classList.remove('hidden');

            sched.innerHTML = `
                <div class="expense-item">
                    <div>
                        <h4>Principal Borrowed</h4>
                    </div>
                    <div>${formatINR(p)}</div>
                </div>

                <div class="expense-item">
                    <div>
                        <h4>Interest Component</h4>
                    </div>
                    <div>+${formatINR(totalInterest)}</div>
                </div>

                <div class="expense-item">
                    <div>
                        <h4>Total Debt Burden</h4>
                    </div>
                    <div>${formatINR(totalPayment)}</div>
                </div>
            `;
        } else {
            res.classList.add('hidden');

            sched.innerHTML =
                '<p>Awaiting valid Loan Parameters...</p>';
        }
    };

    ['emi-p', 'emi-r', 'emi-t'].forEach(id =>
        sel(id).addEventListener('input', calcEMI)
    );

    // --- 5. SIP Calculator ---
    const calcSIP = () => {
        const p = +sel('sip-p').value;
        const rAnnual = +sel('sip-r').value;
        const tYears = +sel('sip-t').value;

        const res = sel('sip-res');

        if (p > 0 && rAnnual > 0 && tYears > 0) {
            const i = rAnnual / 100 / 12;
            const n = tYears * 12;

            const futureValue =
                p *
                ((Math.pow(1 + i, n) - 1) / i) *
                (1 + i);

            const totalInvested = p * n;
            const wealthGained = futureValue - totalInvested;

            res.innerHTML = `
                <div>
                    Invested Capital: ${formatINR(totalInvested)}
                </div>

                <div>
                    Wealth Generated:
                    +${formatINR(wealthGained)}
                </div>

                <div>
                    Projected Value:
                    ${formatINR(futureValue)}
                </div>
            `;

            res.classList.remove('hidden');

            renderSIPChart(tYears, p, rAnnual);
        } else {
            res.classList.add('hidden');
        }
    };

    ['sip-p', 'sip-r', 'sip-t'].forEach(id =>
        sel(id).addEventListener('input', calcSIP)
    );

    // --- 6. Goal Engine ---
    sel('btn-add-goal').onclick = () => {
        const name = sel('goal-name').value.trim();
        const target = +sel('goal-target').value;

        if (name && target > 0) {
            appData.goals.push({
                id: generateUUID(),
                name,
                target
            });

            sel('goal-name').value = '';
            sel('goal-target').value = '';

            renderApp();
        } else {
            alert(
                'SYSTEM HALT: Target amount must be greater than zero.'
            );
        }
    };
}
// 6. MASTER RENDER ENGINE
function renderApp() {
    let totalExpenses = 0;
    appData.transactions.forEach(t => totalExpenses += t.amount);

    let totalAssets = 0;
    appData.accounts.forEach(a => totalAssets += a.balance);

    const currentBalance = appData.budget - totalExpenses;
    const liquidNetWorth = currentBalance + totalAssets;

    // Core Stats
    sel('total-balance').innerText = formatINR(currentBalance);
    sel('total-assets').innerText = formatINR(totalAssets);
    sel('total-expenses').innerText = formatINR(totalExpenses);

    // Recent Transactions
    const rl = sel('recent-transactions');
    rl.innerHTML = '';

    if (appData.transactions.length === 0) {
        rl.innerHTML =
            '<p class="text-secondary p-4 text-center border-dashed rounded mt-4">Ledger is empty.</p>';
    } else {
        appData.transactions.slice(0, 5).forEach(t => {
            const icon = getCategoryIcon(t.category);

            rl.innerHTML += `
                <div class="expense-item">
                    <div class="flex align-center">
                        <div class="expense-icon">${icon}</div>
                        <div>
                            <h4>${t.title}</h4>
                            <p class="text-secondary text-xs">${t.category} • ${t.date}</p>
                        </div>
                    </div>
                    <div class="text-red font-bold text-lg">
                        -${formatINR(t.amount)}
                    </div>
                </div>
            `;
        });
    }

    // Transactions Table
    const tb = sel('transactions-body');
    tb.innerHTML = '';

    if (appData.transactions.length === 0) {
        tb.innerHTML =
            '<tr><td colspan="5" class="text-center text-secondary p-8">No transaction data available.</td></tr>';
    } else {
        appData.transactions.forEach(t => {
            const icon = getCategoryIcon(t.category);

            tb.innerHTML += `
                <tr>
                    <td>${t.date}</td>
                    <td>${t.id}</td>
                    <td>${t.title}</td>
                    <td>${icon} ${t.category}</td>
                    <td>-${formatINR(t.amount)}</td>
                </tr>
            `;
        });
    }

    // Accounts
    const al = sel('accounts-list');
    al.innerHTML = '';

    if (appData.accounts.length === 0) {
        al.innerHTML =
            '<p class="text-secondary p-4 text-center border-dashed rounded mt-4">No external assets tracked.</p>';
    } else {
        appData.accounts.forEach(a => {
            al.innerHTML += `
                <div class="expense-item">
                    <div>${a.name}</div>
                    <div>${formatINR(a.balance)}</div>
                </div>
            `;
        });
    }

    // Goals
    const gl = sel('goals-list');
    gl.innerHTML = '';

    if (appData.goals.length === 0) {
        gl.innerHTML =
            '<p class="text-secondary p-4 text-center border-dashed rounded mt-4">Define a financial target to begin tracking.</p>';
    } else {
        appData.goals.forEach(g => {
            const progressRaw =
                (liquidNetWorth / g.target) * 100;

            const progress = Math.min(
                Math.max(progressRaw, 0),
                100
            );

            gl.innerHTML += `
                <div class="expense-item">
                    <h4>${g.name}</h4>
                    <div>${progress.toFixed(1)}%</div>
                </div>
            `;
        });
    }

    renderCharts();
}

// 7. CHART.JS ANALYTICS ENGINE
function renderCharts() {
    if (!window.Chart) {
        console.warn(
            'Chart.js engine offline. Visualizations disabled.'
        );
        return;
    }

    Chart.defaults.color = '#8B949E';
    Chart.defaults.font.family = "'Outfit', sans-serif";
    Chart.defaults.scale.grid.color =
        'rgba(255,255,255,0.05)';

    const catTotals = {};

    appData.transactions.forEach(t => {
        catTotals[t.category] =
            (catTotals[t.category] || 0) + t.amount;
    });

    const labels =
        Object.keys(catTotals).length
            ? Object.keys(catTotals)
            : ['Awaiting Data'];

    const data =
        Object.values(catTotals).length
            ? Object.values(catTotals)
            : [0];

    const bgColors = [
        '#00E5FF',
        '#7C3AED',
        '#FF3366',
        '#f59e0b',
        '#10b981',
        '#3b82f6'
    ];

    // Bar Chart
    const ctxBar = sel('categoryChart');

    if (ctxBar) {
        if (!appData.charts.expenseBar) {
            appData.charts.expenseBar = new Chart(ctxBar, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Capital Outflow (₹)',
                        data,
                        backgroundColor: '#00E5FF',
                        borderRadius: 8,
                        barThickness: 'flex',
                        maxBarThickness: 40
                    }]
                }
            });
        } else {
            appData.charts.expenseBar.data.labels = labels;
            appData.charts.expenseBar.data.datasets[0].data = data;
            appData.charts.expenseBar.update();
        }
    }

    // Doughnut Chart
    const ctxDoughnut = sel('doughnutChart');

    if (ctxDoughnut) {
        if (!appData.charts.expenseRadial) {
            appData.charts.expenseRadial = new Chart(
                ctxDoughnut,
                {
                    type: 'doughnut',
                    data: {
                        labels,
                        datasets: [{
                            data,
                            backgroundColor: bgColors,
                            borderWidth: 2,
                            borderColor: '#07090C',
                            hoverOffset: 10
                        }]
                    }
                }
            );
        } else {
            appData.charts.expenseRadial.data.labels = labels;
            appData.charts.expenseRadial.data.datasets[0].data = data;
            appData.charts.expenseRadial.update();
        }
    }
}

// SIP Chart
function renderSIPChart(years, monthlyP, rate) {
    if (!window.Chart) return;

    const ctxSIP = sel('sipChart');
    if (!ctxSIP) return;

    if (rate <= 0) {
        alert("Please enter rate higher than 0");
        return;
    }

    const labels = [];
    const investedData = [];
    const returnsData = [];

    const i = rate / 100 / 12;

    for (let yr = 1; yr <= years; yr++) {
        labels.push(`Year ${yr}`);

        const n = yr * 12;
        const currentInvested = monthlyP * n;

        const futureValue =
            monthlyP *
            ((Math.pow(1 + i, n) - 1) / i) *
            (1 + i);

        investedData.push(currentInvested);
        returnsData.push(futureValue);
    }

    if (!appData.charts.sipLineChart) {
        appData.charts.sipLineChart = new Chart(ctxSIP, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Invested Capital',
                        data: investedData,
                        borderColor: '#7C3AED',
                        borderWidth: 3,
                        pointRadius: 4,
                        tension: 0.4
                    },
                    {
                        label: 'Expected Portfolio Value',
                        data: returnsData,
                        borderColor: '#00E5FF',
                        backgroundColor:
                            'rgba(0, 229, 255, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        pointRadius: 4,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    tooltip: {
                        padding: 15
                    }
                }
            }
        });
    } else {
        appData.charts.sipLineChart.data.labels = labels;
        appData.charts.sipLineChart.data.datasets[0].data =
            investedData;
        appData.charts.sipLineChart.data.datasets[1].data =
            returnsData;

        appData.charts.sipLineChart.update();
    }
}  


