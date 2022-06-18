const cv = document.getElementById('canvas');
const ctx = cv.getContext('2d');

let last, level, score, start, curScore
function reinit() {
    last = 1000
    level = []
    for (i = 1; i < 2000; ++i) {
        last += Math.random() * 800 + 100
        level.push(last)
    }

    score = 0

    start = performance.now()

    curScore = 100
}

reinit()

let justPressed = 0
let pressed = new Set()

function _keydown(e) {
    if (!pressed.size) {
        justPressed += 1
    }
    pressed.add(e.code)
}

function _keyup(e) {
    pressed.delete(e.code)
}

function _mousedown(e) {
    if (e.x < window.innerWidth * 0.1 && e.y > window.innerHeight * 0.9) {
        reinit()
    } else {
        if (!pressed.size) {
            justPressed = true
        }
        pressed.add(e.button)
    }
}

function _mouseup(e) {
    pressed.delete(e.button)
}

function _keyup_all(e) {
    pressed.clear()
}

document.addEventListener('mousedown', _mousedown);
document.addEventListener('mouseup', _mouseup);

document.addEventListener('keydown', _keydown);
document.addEventListener('keyup', _keyup);
window.addEventListener("focus", _keyup_all)

function animate() {
    let t = performance.now() - start
    t *= 0.8 + t * 0.000003

    cv.width = document.documentElement.clientWidth
    cv.height = document.documentElement.clientHeight

    let vw = Math.min(cv.width, cv.height) / 1000

    ctx.clearRect(0, 0, cv.width, cv.height);

    for (let pos of level) {
        ctx.fillStyle = '#000';
        ctx.fillRect(pos-t*vw, 10*vw, 20*vw, 100*vw);

        if (t*vw > pos) {
            score -= 50
            let index = level.indexOf(pos)
            level.splice(index, 1)
        }
    }

    if (justPressed) {
        for (let i = 0; i < justPressed; ++i) {
            let goal = cv.width/2+t*vw

            let closest = level.reduce(function(prev, curr) {
                return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
            })

            curScore = Math.max(-50, (150 - Math.abs(closest - goal))/1.5)
            score += curScore
            console.log(curScore)

            let index = level.indexOf(closest)
            if (index > -1 && curScore > 0) {
                level.splice(index, 1)
            }
        }
        justPressed = false
    }

    ctx.fillStyle = '#f00'
    ctx.fillRect(cv.width/2-2*vw, 0, 4*vw, cv.height)

    ctx.beginPath()
    let shift = 0
    if (pressed.size) {
        shift = 10
    }
    ctx.arc(cv.width/2 + shift, cv.height/2 + 70*vw + shift, 370*vw, 0, 2 * Math.PI, false)
    let hue = ((curScore/100)*120).toString(10)
    ctx.fillStyle = 'hsl(' + hue + ',100%,50%)'
    if (!pressed.size) {
        ctx.shadowOffsetX = 10
        ctx.shadowOffsetY = 10
        ctx.shadowBlur = 5
        ctx.shadowColor = "black"
    }
    ctx.fill()

    let showScore = Math.round(score / 25)
    localStorage.setItem('record', Math.max(localStorage.getItem('record'), showScore))
    ctx.shadowColor = 'rgba(0, 0, 0, 0)'
    ctx.fillStyle = '#000'
    ctx.font = '8vh sans-serif';
    ctx.fillText(showScore, 50*vw, 220*vw);
    ctx.font = '4vh sans-serif';
    ctx.fillText('record: ' + localStorage.getItem('record'), 50*vw, 300*vw);

    ctx.font = '3vh sans-serif';
    ctx.fillText('reset', 50*vw, cv.height - 20*vw);

    requestAnimationFrame(animate)
}

animate();
