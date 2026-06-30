/**
 * FINTECH BY AMITY - CORE OS SYSTEM (v2.0)
 * Massive architectural expansion featuring Three.js 3D Rendering,
 * Complex Financial Algorithms (SIP, EMI Amortization), Chart.js integrations,
 * and robust state management. Designed to exceed 1000 lines in combined logic.
 */

// ==========================================
// 1. GLOBAL STATE MANAGEMENT
// ==========================================
const appData = {
    budget: 0,
    transactions: [],
    accounts: [],
    goals: [],
    charts: { expenseBar: null, expenseRadial: null, sipLineChart: null },
    ui: {
        currentView: 'landing',
        isMobile: window.innerWidth <= 768
    }
};

// ==========================================
// 2. UTILITY & HELPER FUNCTIONS
// ==========================================
const formatINR = (num) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(num);
};

const sel = (id) => document.getElementById(id);

const generateUUID = () => {
    return 'tx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const getCategoryIcon = (cat) => {
    const icons = { 'Housing': '🏠', 'Food': '🍔', 'Transport': '🚗', 'Shopping': '🛍️', 'Utilities': '⚡', 'Other': '📌' };
    return icons[cat] || '📌';
};

// ==========================================
// 3. THREE.JS 3D CINEMATIC LAUNCH ENGINE
// ==========================================
let scene, camera, renderer, particles, animationId;

function initThreeJS() {
    const container = sel('three-container');
    if (!container) return;

    // Scene Setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030407, 0.001);

    // Camera Setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 1000;

    // Renderer Setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x030407, 1);
    container.appendChild(renderer.domElement);

    // Particle System (The "Launch" Effect)
    const geometry = new THREE.BufferGeometry();
    const particleCount = 15000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x00E5FF); // Cyan
    const color2 = new THREE.Color(0x7C3AED); // Purple

    for (let i = 0; i < particleCount * 3; i += 3) {
        // Spherical distribution
        const radius = 800 + Math.random() * 1200;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos((Math.random() * 2) - 1);

        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);

        // Mix colors
        const mixedColor = color1.clone().lerp(color2, Math.random());
        colors[i] = mixedColor.r;
        colors[i + 1] = mixedColor.g;
        colors[i + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 3,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Helper function to create massive, glowing symbol textures natively
    function createSymbolTexture(text, color) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '900 850px "Outfit", sans-serif';
        
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(text, 512, 512);
        
        const tex = new THREE.CanvasTexture(canvas);
        tex.anisotropy = 16;
        return tex;
    }

    // 3D Extrusion Engine (Faux-Volumetric Stacking for Text)
    function create3DTextGroup(texture, coreColor) {
        const group = new THREE.Group();
        const layers = 25; // Number of slices
        const thickness = 3; // Gap between slices
        
        for (let i = 0; i < layers; i++) {
            const isCap = (i === 0 || i === layers - 1);
            const mat = new THREE.MeshBasicMaterial({ 
                map: texture, 
                transparent: true, 
                alphaTest: 0.1, // Crops the transparent pixels to create solid edges
                color: isCap ? 0xffffff : coreColor, // White faces, colored 3D depth
                side: THREE.DoubleSide
            });
            const mesh = new THREE.Mesh(new THREE.PlaneGeometry(450, 450), mat);
            mesh.position.z = (i - layers/2) * thickness;
            group.add(mesh);
        }
        return group;
    }

    // 3D Rupee
    const rupeeTex = createSymbolTexture('₹', '#00E5FF');
    const rupeeMesh = create3DTextGroup(rupeeTex, 0x00E5FF);
    rupeeMesh.position.x = -250;
    scene.add(rupeeMesh);
    window.rupeeMesh = rupeeMesh;

    // 3D Dollar
    const dollarTex = createSymbolTexture('$', '#a78bfa');
    const dollarMesh = create3DTextGroup(dollarTex, 0x7C3AED);
    dollarMesh.position.x = 250;
    scene.add(dollarMesh);
    window.dollarMesh = dollarMesh;

    // Grid Helper for High-Tech look
    const grid = new THREE.GridHelper(2000, 40, 0x00E5FF, 0x00E5FF);
    grid.position.y = -400;
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Resize Handler
    window.addEventListener('resize', onWindowResize, false);

    // Start Animation Loop
    animateThreeJS();
    
    // Launch Sequence Timeline
    triggerLaunchSequence();
}

function animateThreeJS() {
    animationId = requestAnimationFrame(animateThreeJS);
    
    // Spin particles and core
    if (particles) {
        particles.rotation.y += 0.002;
        particles.rotation.x += 0.001;
    }
    // Spin currency symbols horizontally only
    if (window.rupeeMesh) {
        window.rupeeMesh.rotation.y += 0.03; // Horizontal only
    }
    if (window.dollarMesh) {
        window.dollarMesh.rotation.y -= 0.03; // Horizontal only
    }
    
    // Dramatic Camera Zoom
    if (camera.position.z > 400) {
        camera.position.z -= 4; // Zoom in fast
    }
    
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function triggerLaunchSequence() {
    // After 4.0 seconds, reveal the UI over the 3D canvas
    setTimeout(() => {
        sel('view-landing').classList.remove('hidden');
        sel('view-landing').style.opacity = '0';
        sel('view-landing').style.transition = 'opacity 1s ease';
        
        // Trigger reflow
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
            // Show normal background
            sel('global-bg').classList.remove('hidden');
        }, 1500);
    }
}

// ==========================================
// 4. MAIN APPLICATION LIFECYCLE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // Start 3D Engine immediately
    if (typeof THREE !== 'undefined') {
        initThreeJS();
    } else {
        // Fallback if Three.js fails to load
        sel('view-landing').classList.remove('hidden');
        sel('global-bg').classList.remove('hidden');
    }

    // 4a. Initialize OS Button
    sel('btn-enter').onclick = () => {
        const b = +sel('startup-budget').value;
        if(b >= 0 && sel('startup-budget').value !== "") {
            appData.budget = b;
            
            // Transition out landing
            sel('view-landing').style.opacity = '0';
            destroyThreeJS(); // Kill WebGL to save memory
            
            setTimeout(() => {
                sel('view-landing').classList.remove('active');
                sel('view-landing').classList.add('hidden');
                
                sel('main-layout').classList.remove('hidden');
                sel('main-layout').style.opacity = '0';
                
                setTimeout(() => {
                    sel('main-layout').style.opacity = '1';
                    renderApp(); // Master render
                }, 50);
            }, 600);
        } else {
            alert('CRITICAL ERROR: Valid numeric startup budget required for initialization.');
        }
    };

    // 4b. Sidebar Routing Logic
    document.querySelectorAll('.nav-links li').forEach(l => {
        l.onclick = () => {
            document.querySelectorAll('.nav-links li').forEach(x => x.classList.remove('active'));
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
                    
                    // Special hook for Analytics view rendering
                    if(l.dataset.view === 'analytics' || l.dataset.view === 'investments') {
                        renderCharts();
                    }
                }
            }, 250);
        };
    });

    // Initialize Widget Event Listeners
    initWidgetListeners();
});

// ==========================================
// 5. WIDGET EVENT BINDINGS
// ==========================================
function initWidgetListeners() {
    
    // --- 1. Quick Interest Calculator ---
    const calcInt = () => {
        const p = +sel('calc-p').value, r = +sel('calc-r').value, t = +sel('calc-t').value;
        const res = sel('calc-res');
        if (p > 0 && r > 0 && t > 0) {
            const int = (p * r * t) / 100;
            res.innerHTML = `Yield: ${formatINR(int)}<br>Maturity Value: ${formatINR(p + int)}`;
            res.classList.remove('hidden');
        } else {
            res.classList.add('hidden');
        }
    };
    ['calc-p', 'calc-r', 'calc-t'].forEach(id => sel(id).addEventListener('input', calcInt));

    // --- 2. Master Transaction Engine ---
    sel('btn-add-txn').onclick = () => {
        const title = sel('new-txn-title').value.trim() || 'Uncategorized Debit';
        const amount = +sel('new-txn-amount').value;
        const cat = sel('new-txn-cat').value;
        let date = sel('new-txn-date').value;

        if (!date) date = new Date().toISOString().split('T')[0];

        if(amount > 0) {
            appData.transactions.push({
                id: generateUUID(),
                date: date,
                title: title,
                category: cat,
                amount: amount
            });
            // Sort chronologically descending
            appData.transactions.sort((a, b) => b.date.localeCompare(a.date));
            
            // Reset fields
            sel('new-txn-title').value = '';
            sel('new-txn-amount').value = '';
            sel('new-txn-date').value = '';
            sel('new-txn-title').focus(); // Accessibility
            
            renderApp();
        } else {
            alert('SYSTEM HALT: Transaction amount must be greater than zero.');
        }
    };

    // Routing shortcut for "View All"
    sel('view-all-txns').onclick = () => {
        document.querySelector('.nav-links li[data-view="transactions"]').click();
    };

    // --- 3. Bank Accounts / Assets Manager ---
    sel('btn-add-acc').onclick = () => {
        const name = sel('new-acc-name').value.trim();
        const bal = +sel('new-acc-bal').value;
        if(name && bal >= 0 && sel('new-acc-bal').value !== "") {
            appData.accounts.push({ name, balance: bal, id: generateUUID() });
            sel('new-acc-name').value = '';
            sel('new-acc-bal').value = '';
            renderApp();
        } else {
            alert('SYSTEM HALT: Invalid Asset parameters.');
        }
    };

    // --- 4. Loan Amortization Algorithm ---
    const calcEMI = () => {
        const p = +sel('emi-p').value;
        const r_annual = +sel('emi-r').value;
        const n = +sel('emi-t').value;
        const res = sel('emi-res');
        const sched = sel('emi-schedule');

        if (p > 0 && r_annual > 0 && n > 0) {
            const r = r_annual / 12 / 100; // Monthly rate
            // EMI = [P x R x (1+R)^N]/[(1+R)^N-1]
            const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            const totalPayment = emi * n;
            const totalInterest = totalPayment - p;

            res.innerHTML = `Monthly Installment: <br><span style="font-size: 2.5rem">${formatINR(emi)}</span>`;
            res.classList.remove('hidden');

            sched.innerHTML = `
                <div class="expense-item">
                    <div><h4>Principal Borrowed</h4><p class="text-xs text-secondary">Initial Loan Amount</p></div>
                    <div class="font-bold text-lg">${formatINR(p)}</div>
                </div>
                <div class="expense-item">
                    <div><h4>Interest Component</h4><p class="text-xs text-secondary">Cost of Debt</p></div>
                    <div class="text-red font-bold text-lg">+${formatINR(totalInterest)}</div>
                </div>
                <div class="divider mt-2 mb-2"></div>
                <div class="expense-item" style="background: rgba(0,229,255,0.05); border-color: rgba(0,229,255,0.2);">
                    <div><h4 class="text-cyan">Total Debt Burden</h4><p class="text-xs text-secondary">Over ${n} months</p></div>
                    <div class="text-cyan font-extrabold text-xl">${formatINR(totalPayment)}</div>
                </div>
            `;
        } else {
            res.classList.add('hidden');
            sched.innerHTML = '<p class="text-secondary p-4 text-center border-dashed rounded mt-4">Awaiting valid Loan Parameters...</p>';
        }
    };
    ['emi-p', 'emi-r', 'emi-t'].forEach(id => sel(id).addEventListener('input', calcEMI));

    // --- 5. Mutual Fund SIP Projection (Compound Math) ---
    const calcSIP = () => {
        const p = +sel('sip-p').value;
        const r_annual = +sel('sip-r').value;
        const t_years = +sel('sip-t').value;
        const res = sel('sip-res');

        if (p > 0 && r_annual > 0 && t_years > 0) {
            const i = r_annual / 100 / 12;
            const n = t_years * 12;
            
            // Standard SIP Formula
            const futureValue = p * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
            const totalInvested = p * n;
            const wealthGained = futureValue - totalInvested;

            res.innerHTML = `
                <div class="flex-between mb-2"><span class="text-secondary text-sm">Invested Capital:</span> <span>${formatINR(totalInvested)}</span></div>
                <div class="flex-between mb-4"><span class="text-secondary text-sm">Wealth Generated:</span> <span class="text-green">+${formatINR(wealthGained)}</span></div>
                <div class="divider mb-4"></div>
                <div class="text-secondary text-xs uppercase tracking-wide">Projected Maturity Value</div>
                <div class="text-cyan font-extrabold text-3xl mt-2">${formatINR(futureValue)}</div>
            `;
            res.classList.remove('hidden');

            // Hook into Chart Engine
            renderSIPChart(t_years, p, r_annual);
        } else {
            res.classList.add('hidden');
        }
    };
    ['sip-p', 'sip-r', 'sip-t'].forEach(id => sel(id).addEventListener('input', calcSIP));

    // --- 6. Financial Goals Engine ---
    sel('btn-add-goal').onclick = () => {
        const name = sel('goal-name').value.trim();
        const target = +sel('goal-target').value;
        if(name && target > 0) {
            appData.goals.push({ id: generateUUID(), name, target });
            sel('goal-name').value = '';
            sel('goal-target').value = '';
            renderApp();
        } else {
            alert('SYSTEM HALT: Target amount must be greater than zero.');
        }
    };
}

// ==========================================
// 6. MASTER RENDER ENGINE
// ==========================================
function renderApp() {
    // Phase 1: Mathematical Aggregation
    let totalExpenses = 0;
    appData.transactions.forEach(t => totalExpenses += t.amount);
    
    let totalAssets = 0;
    appData.accounts.forEach(a => totalAssets += a.balance);

    const currentBalance = appData.budget - totalExpenses;
    const liquidNetWorth = currentBalance + totalAssets;

    // Phase 2: DOM Injection for Core Stats
    sel('total-balance').innerText = formatINR(currentBalance); 
    sel('total-assets').innerText = formatINR(totalAssets);
    sel('total-expenses').innerText = formatINR(totalExpenses);

    // Phase 3: Recent Transactions Widget (Dashboard)
    const rl = sel('recent-transactions'); rl.innerHTML = '';
    if (appData.transactions.length === 0) {
        rl.innerHTML = '<p class="text-secondary p-4 text-center border-dashed rounded mt-4">Ledger is empty.</p>';
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
                    <div class="text-red font-bold text-lg">-${formatINR(t.amount)}</div>
                </div>
            `;
        });
    }

    // Phase 4: Master Ledger Table (Transactions View)
    const tb = sel('transactions-body'); tb.innerHTML = '';
    if (appData.transactions.length === 0) {
        tb.innerHTML = '<tr><td colspan="5" class="text-center text-secondary p-8">No transaction data available for master ledger.</td></tr>';
    } else {
        appData.transactions.forEach(t => {
            const icon = getCategoryIcon(t.category);
            tb.innerHTML += `
                <tr>
                    <td class="font-medium">${t.date}</td>
                    <td class="text-xs text-secondary font-mono">${t.id}</td>
                    <td class="font-bold text-white">${t.title}</td>
                    <td><span class="glass px-4 py-2 rounded-xl text-xs">${icon} ${t.category}</span></td>
                    <td class="text-red font-bold text-right text-lg">-${formatINR(t.amount)}</td>
                </tr>
            `;
        });
    }

    // Phase 5: Assets & Bank Accounts
    const al = sel('accounts-list'); al.innerHTML = '';
    if (appData.accounts.length === 0) {
        al.innerHTML = '<p class="text-secondary p-4 text-center border-dashed rounded mt-4">No external assets tracked.</p>';
    } else {
        appData.accounts.forEach(a => {
            al.innerHTML += `
                <div class="expense-item">
                    <div class="flex align-center">
                        <div class="expense-icon" style="background: rgba(124,58,237,0.1); color: var(--accent-purple);">🏦</div>
                        <div>
                            <h4>${a.name}</h4>
                            <p class="text-xs text-secondary">Verified Asset</p>
                        </div>
                    </div>
                    <div class="text-cyan font-bold text-lg">${formatINR(a.balance)}</div>
                </div>
            `;
        });
    }

    // Phase 6: Financial Goals Progress Tracker
    const gl = sel('goals-list'); gl.innerHTML = '';
    if (appData.goals.length === 0) {
        gl.innerHTML = '<p class="text-secondary p-4 text-center border-dashed rounded mt-4">Define a financial target to begin tracking.</p>';
    } else {
        appData.goals.forEach(g => {
            const progressRaw = (liquidNetWorth / g.target) * 100;
            const progress = Math.min(Math.max(progressRaw, 0), 100);
            const isComplete = progress >= 100;
            
            gl.innerHTML += `
                <div class="expense-item" style="display:block; padding: 1.5rem;">
                    <div class="flex-between align-center mb-2">
                        <h4 class="text-lg ${isComplete ? 'text-green' : ''}">${isComplete ? '🎉 ' : ''}${g.name}</h4>
                        <span class="font-extrabold ${isComplete ? 'text-green' : 'text-cyan'} text-xl">${progress.toFixed(1)}%</span>
                    </div>
                    <div class="progress-bg"><div class="progress-fill ${isComplete ? 'bg-green' : ''}" style="width: ${progress}%;"></div></div>
                    <div class="goal-meta mt-4">
                        <span>Target: <strong class="text-white">${formatINR(g.target)}</strong></span>
                        <span>Allocated: <strong class="text-white">${formatINR(Math.min(liquidNetWorth, g.target))}</strong></span>
                    </div>
                </div>
            `;
        });
    }

    // Phase 7: Dispatch Chart Updates
    renderCharts();
}

// ==========================================
// 7. CHART.JS ANALYTICS ENGINE
// ==========================================
function renderCharts() {
    if(!window.Chart) {
        console.warn('Chart.js engine offline. Visualizations disabled.');
        return;
    }
    
    Chart.defaults.color = '#8B949E';
    Chart.defaults.font.family = "'Outfit', sans-serif";
    Chart.defaults.scale.grid.color = 'rgba(255,255,255,0.05)';

    // Aggregation Logic for Categories
    const catTotals = {};
    appData.transactions.forEach(t => { 
        catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; 
    });
    
    const labels = Object.keys(catTotals).length ? Object.keys(catTotals) : ['Awaiting Data'];
    const data = Object.values(catTotals).length ? Object.values(catTotals) : [0];
    
    // Fintech Corporate Color Palette
    const bgColors = ['#00E5FF', '#7C3AED', '#FF3366', '#f59e0b', '#10b981', '#3b82f6'];

    // --- Chart 1: Bar Chart (Linear Distribution) ---
    const ctxBar = sel('categoryChart');
    if (ctxBar) {
        if (!appData.charts.expenseBar) {
            appData.charts.expenseBar = new Chart(ctxBar, {
                type: 'bar',
                data: { 
                    labels: labels, 
                    datasets: [{ 
                        label: 'Capital Outflow (₹)', 
                        data: data, 
                        backgroundColor: '#00E5FF', 
                        borderRadius: 8,
                        barThickness: 'flex',
                        maxBarThickness: 40
                    }] 
                },
                options: { 
                    responsive:true, maintainAspectRatio:false, 
                    plugins: { legend: {display: false}, tooltip: { mode: 'index', intersect: false, padding: 12, cornerRadius: 8 } },
                    scales: { y: { beginAtZero: true } }
                }
            });
        } else {
            appData.charts.expenseBar.data.labels = labels;
            appData.charts.expenseBar.data.datasets[0].data = data;
            appData.charts.expenseBar.update();
        }
    }

    // --- Chart 2: Doughnut Chart (Radial Breakdown) ---
    const ctxDoughnut = sel('doughnutChart');
    if (ctxDoughnut) {
        if (!appData.charts.expenseRadial) {
            appData.charts.expenseRadial = new Chart(ctxDoughnut, {
                type: 'doughnut',
                data: { 
                    labels: labels, 
                    datasets: [{ 
                        data: data, 
                        backgroundColor: bgColors, 
                        borderWidth: 2,
                        borderColor: '#07090C',
                        hoverOffset: 10
                    }] 
                },
                options: { 
                    responsive:true, maintainAspectRatio:false, cutout: '75%',
                    plugins: { legend: { position: 'right', labels: { padding: 20 } } }
                }
            });
        } else {
            appData.charts.expenseRadial.data.labels = labels;
            appData.charts.expenseRadial.data.datasets[0].data = data;
            appData.charts.expenseRadial.update();
        }
    }
}

// --- Chart 3: SIP Line Chart Projection ---
function renderSIPChart(years, monthlyP, rate) {
    if(!window.Chart) return;
    const ctxSIP = sel('sipChart');
    if (!ctxSIP) return;

    const labels = [];
    const investedData = [];
    const returnsData = [];
    
    const i = rate / 100 / 12;
    
    // Generate data points for each year
    for(let yr = 1; yr <= years; yr++) {
        labels.push(`Year ${yr}`);
        const n = yr * 12;
        const currentInvested = monthlyP * n;
        const futureValue = monthlyP * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
        investedData.push(currentInvested);
        returnsData.push(futureValue);
    }

    if (!appData.charts.sipLineChart) {
        appData.charts.sipLineChart = new Chart(ctxSIP, {
            type: 'line',
            data: {
                labels: labels,
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
                        backgroundColor: 'rgba(0, 229, 255, 0.1)', 
                        borderWidth: 3,
                        fill: true, 
                        pointRadius: 4,
                        tension: 0.4 
                    }
                ]
            },
            options: { 
                responsive:true, maintainAspectRatio:false,
                interaction: { mode: 'index', intersect: false },
                plugins: { tooltip: { padding: 15 } }
            }
        });
    } else {
        appData.charts.sipLineChart.data.labels = labels;
        appData.charts.sipLineChart.data.datasets[0].data = investedData;
        appData.charts.sipLineChart.data.datasets[1].data = returnsData;
        appData.charts.sipLineChart.update();
    }
}
