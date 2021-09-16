let ball
let t
let lastHandX, lastHandY, lastHandVX, lastHandVY

let bgColor = 'darkblue'

const floor = 500
const hoopHeight = 120

const _hoopHeight = floor - hoopHeight

const ballSize = 50

const hoopX = 100
const hoopWidth = ballSize * 1.4

class Transformer {
  // https://github.com/ChristerNilsson/Transformer

  constructor(x, y, a, s, stack) {
    this.x = x != null ? x : 0
    this.y = y != null ? y : 0
    this.a = a != null ? a : 0
    this.s = s != null ? s : 1
    this.stack = stack != null ? stack : []
  }

  push() {
    push()
    return this.stack.push([this.x, this.y, this.a, this.s])
  }

  pop() {
    var ref
    pop()
    return ref = this.stack.pop(), this.x = ref[0], this.y = ref[1], this.a = ref[2], this.s = ref[3], ref
  }

  rotate(da) {
    rotate(da)
    return this.a += da
  }

  scale(ds) {
    scale(ds)
    return this.s *= ds
  }

  translate(dx, dy) {
    translate(dx, dy)
    this.x += this.s * dx * cos(this.a) - this.s * dy * sin(this.a)
    return this.y += this.s * dy * cos(this.a) + this.s * dx * sin(this.a)
  }

}

class Ball {

  constructor() {

    this.size = ballSize

    this.v = {
      x: 0,
      y: 0,
    }

    this.x = 300
    this.y = 450

  }

  draw() {

    t.push()

    fill('orange')

    ellipse(
      this.x,
      this.y,
      this.size,
      this.size
    )

    t.pop()

  }

  move() {


    // Bounce off walls
    if (this.x < this.size / 2) {
      this.x = this.size / 2
      this.v.x *= -0.65
      this.v.y *= 0.65
    } else if (this.x > width - this.size / 2) {
      this.x = width - this.size / 2
      this.v.x *= -0.65
      this.v.y *= 0.65
    }

    if (this.y > floor - this.size / 2 - 1) {

      // Bounce off floor
      this.y = floor - this.size / 2
      this.v.y *= -0.65
      this.v.x *= 0.99

    } else {

      // Gravity
      this.v.y += 0.4

    }

    const prevY = this.y

    this.x = this._held ? lastHandX : this.x + this.v.x
    this.y = this._held ? lastHandY + 30 : this.y + this.v.y

    if (
      prevY <= _hoopHeight
      && this.y > _hoopHeight
      && this.x > hoopX
      && this.x < hoopX + hoopWidth
    ) {
      sunkBasket()
    }

  }

  get held() {
    return this._held
  }

  set held(value) {

    if (this._held === true && value === false) {
      this.v.x = lastHandVX
      this.v.y = lastHandVY
    } else if (this._held === false && value === true) {
      this.v.x = 0
      this.v.y = 0
    }
    this._held = value
  }

}

function setup() {

  rectMode(CENTER)
  createCanvas(600, 600)

  t = new Transformer()

}

function init() {
  if (ball) { return }
  ball = new Ball()
}

function draw() {

  init()

  background(bgColor)

  // Floor
  fill('grey')
  rect(0, floor + 100, width * 2, 200)

  ball.move()
  ball.draw()

  fill('lightgrey')
  drawRobotArm()


}

let hand_t = 1

function drawRobotArm() {

  const baseX = 500
  const baseY = floor

  const elbowPadding = 10

  const arm1Thickness = 40
  const arm2Thickness = 33
  const arm3Thickness = 22

  const arm1length = 150
  const arm2length = 120
  const arm3length = 180

  const arm1upperLimit = Math.PI * 1.45
  const arm1lowerLimit = Math.PI * 1.1

  const arm2upperLimit = -Math.PI * 0.7
  const arm2lowerLimit = Math.PI * 0.1

  const arm3upperLimit = arm2upperLimit
  const arm3lowerLimit = arm2lowerLimit

  const arm1_t = mouseX / width
  const arm2_t = mouseY / height
  const arm3_t = arm1_t

  const arm1Rotation = arm1lowerLimit + arm1_t * (arm1upperLimit - arm1lowerLimit)
  const arm2Rotation = arm2lowerLimit + arm2_t * (arm2upperLimit - arm2lowerLimit)
  const arm3Rotation = arm3lowerLimit + arm3_t * (arm3upperLimit - arm3lowerLimit)

  const handSize = 50

  const handOpen = 1.5
  const handClosed = 0.5

  // const hand_t = ( 1 + Math.sin(frameCount * 0.093) ) / 2

  const handOpenness = lerp(handClosed, handOpen, hand_t)

  const totalRotation = arm1Rotation + arm2Rotation + arm3Rotation

  const elbow1Size = arm1Thickness + elbowPadding
  const elbow2Size = arm2Thickness + elbowPadding
  const elbow3Size = arm3Thickness + elbowPadding

  /**
   * Draw base
   */

  arc(baseX, baseY, 90, 90, Math.PI - 0.2, 0.2, CHORD)

  /**
   * Draw first part of arm
   */

  t.push()

  // fill('orange')

  t.translate(baseX, baseY)
  t.rotate(arm1Rotation)
  rect(arm1length / 2 + 20, arm1Thickness / 2, arm1length, arm1Thickness)
  ellipse(20, arm1Thickness / 2, arm1Thickness, arm1Thickness)

  /**
   * Draw second part of arm
   */

  t.push()
  t.translate(arm1length + 20, arm2Thickness / 2)
  t.rotate(arm2Rotation)

  // fill('red')


  rect(arm2length / 2, 0, arm2length, arm2Thickness)
  // ellipse(arm2length, 0, elbowSize, elbowSize)
  ellipse(0, 0, elbow1Size, elbow1Size)


  /**
   * Draw third part of arm
   */

  t.push()
  t.translate(arm2length, 0)
  t.rotate(arm3Rotation)

  // fill('green')

  rect(arm3length / 2, 0, arm3length, arm3Thickness)
  // ellipse(arm3length, 0, elbowSize, elbowSize)
  ellipse(0, 0, elbow2Size, elbow2Size)

  /**
   * Draw hand
   */

  t.translate(arm3length, 0)

  noFill()
  t.rotate(-totalRotation)

  strokeWeight(12)
  stroke('black')
  arc(0, handSize * 0.5, handSize, handSize * 0.8, -1.5 * Math.PI + handOpenness, 0.5 * Math.PI - handOpenness, OPEN)

  strokeWeight(10)
  stroke('lightgrey')
  arc(0, handSize * 0.5, handSize, handSize * 0.8, -1.5 * Math.PI + handOpenness, 0.5 * Math.PI - handOpenness, OPEN)

  fill('lightgrey')
  stroke('black')
  strokeWeight(1)
  ellipse(0, 0, elbow3Size, elbow3Size)

  // Record hand velocity and position
  lastHandVX = t.x - lastHandX
  lastHandVY = t.y - lastHandY

  lastHandX = t.x
  lastHandY = t.y

  // Pop back to origin
  t.pop()
  t.pop()
  t.pop()

  t.push()

  const hoopPoleThickness = 5

  // Draw basketball hoop
  fill('white')
  const verticalRopes = 15
  const horizontalRopes = 4
  const basketDepth = 50
  const basketShear = 0.12
  stroke('white')
  for (let i = 0; i < verticalRopes; i++) {

    line(
      hoopX + i / (verticalRopes - 1) * hoopWidth,
      floor - hoopHeight,
      hoopX + (basketShear + (1 - 2 * basketShear) * i / (verticalRopes - 1)) * hoopWidth,
      floor - hoopHeight + basketDepth
    )

  }
  noStroke()
  fill('black')
  rect(hoopX, floor - hoopHeight * 0.5, hoopPoleThickness, hoopHeight)
  fill('darkred')
  rect(hoopX + 0.5 * hoopWidth, floor - hoopHeight, hoopWidth, hoopPoleThickness)

  t.pop()

}

function mousePressed() {

  if (hand_t === 0) {
    ball.held = false
    hand_t = 1
    return
  }

  // Close hand
  hand_t = 0

  // Pick up ball?
  const d = dist(ball.x, ball.y, lastHandX, lastHandY)
  if (d < ball.size) {
    ball.held = true
  }


}

function sunkBasket() {

  bgColor = 'lightblue'
  window.setTimeout(() => {
    bgColor = 'darkblue'
  }, 200)

}