// Initialization of variables
let arc = [180, 270];
let taps = 0;
let score = 0;
let best = localStorage.getItem('best') ?? 0;
let state = "init";
let prevTapTime = 0;
const colors = [
	"#ED5565", "#D9444F", "#ED5F56", "#DA4C43", "#F87D52", "#E7663F",
	"#FAB153", "#F59B43", "#FDCE55", "#F6BA43", "#C2D568", "#B1C353",
	"#99D469", "#83C251", "#42CB70", "#3CB85D", "#47CEC0", "#3BBEB0",
	"#4FC2E7", "#3CB2D9", "#5C9DED", "#4C8CDC", "#9398EC", "#7277D5",
	"#CC93EF", "#B377D9", "#ED87BF", "#D870AE",
];

// Helper functions
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
	const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
	return {
		x: centerX + radius * Math.cos(angleInRadians),
		y: centerY + radius * Math.sin(angleInRadians),
	};
}

function describeArc(x, y, radius, startAngle, endAngle) {
	const start = polarToCartesian(x, y, radius, endAngle);
	const end = polarToCartesian(x, y, radius, startAngle);
	const arcFlag = endAngle - startAngle <= 180 ? "0" : "1";
	const d = ["M", start.x, start.y, "A", radius, radius, 0, arcFlag, 0, end.x, end.y].join(" ");
	return d;
}

function getAngle(cx, cy, ex, ey) {
	const dy = ey - cy;
	const dx = ex - cx;
	let theta = Math.atan2(dx, -dy);
	theta *= 180 / Math.PI;
	theta = theta < 0 ? theta + 360 : theta;
	return theta;
}

function getBallAngle() {
	const bg = document.getElementById("bg").getBoundingClientRect();
	const bgCenter = { x: bg.left + bg.width / 2, y: bg.top + bg.height / 2 };
	const ball = document.getElementById("ball").getBoundingClientRect();
	const ballCenter = { x: ball.left + ball.width / 2, y: ball.top + ball.height / 2 };
	return getAngle(bgCenter.x, bgCenter.y, ballCenter.x, ballCenter.y);
}

function setArc() {
	const random = (i, j) => Math.floor(Math.random() * (j - i)) + i;
	let newArc = [];
	newArc.push(random(0, 300));
	newArc.push(random(newArc[0] + 10, newArc[0] + 110));
	newArc[1] = newArc[1] > 360 ? 360 : newArc[1];
	arc = newArc;
	document.getElementById("arc").setAttribute("d", describeArc(50, 50, 40, arc[0], arc[1]));
	document.getElementById("arc").setAttribute("stroke", colors[Math.floor(score / 10) % colors.length]);
}

function startPlay() {
	state = "started";
	taps = 0;
	score = 0;
	prevTapTime = Date.now();
	document.getElementById("tip").style.display = "none";
	document.getElementById("play").style.display = "none";
	document.getElementById("score").innerHTML = score;
	document.getElementById("finalscore").innerHTML = "";
	document.getElementById("best").innerHTML = "";
	document.getElementById("ball").style.animationDuration = (2000 - taps * 5) + "ms";
	document.getElementById("ball").style.animationPlayState = "running";
}

function stopPlay() {
	if (state === "started") {
		state = "stopped";
		if (score > best) {
			best = score;
			localStorage.setItem("best", best);
		}
		document.getElementById("finalscore").innerHTML = score;
		document.getElementById("best").innerHTML = 'Best: ' + best;
		document.getElementById("play").style.display = "block";
		document.getElementById("ball").style.animationPlayState = "paused";
	}
}

function tap(e) {
	e.preventDefault();
	e.stopPropagation();
	if (state === "started") {
		const ballAngle = getBallAngle();
		// adding a 6 for better accuracy as the arc stroke extends beyond the angle.
		if (ballAngle + 6 > arc[0] && ballAngle - 6 < arc[1]) {
			const currentTapTime = Date.now();
			const tapInterval = currentTapTime - prevTapTime;
			taps++;
			score = score + (tapInterval < 500 ? 5 : tapInterval < 1000 ? 2 : 1);
			prevTapTime = currentTapTime;
			setArc();
			document.getElementById("score").innerHTML = score;
			document.getElementById("ball").style.animationDuration = (2000 - taps * 5) + "ms";
		} else stopPlay();
	}
}

document.getElementById("play").addEventListener("click", startPlay);

if ("ontouchstart" in window) {
	window.addEventListener("touchstart", tap);
} else {
	window.addEventListener("mousedown", tap);
	window.onkeydown = (e) => {
		if (e.keyCode == 32) {
			if (state === "stopped" || state === "init") {
				startPlay();
			} else {
				tap(e);
			}
		}
	};
}

// Initialize the arc
setArc();