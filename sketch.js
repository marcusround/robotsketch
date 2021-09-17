let ball
let t
let lastHandX, lastHandY, lastHandVX, lastHandVY

let bgColor = 'darkblue'

const floor = 500
const hoopHeight = 120

const _hoopHeight = floor - hoopHeight

const ballSize = 35

const hoopX = 300
const hoopWidth = ballSize * 1.4

const HandCommand = {
  OPEN: 1,
  CLOSED: 0,
}

let score = 0

const animatableParameters = {
  handt: HandCommand.OPEN,
  arm1t: 0.0,
  arm2t: 0.0,
  arm3t: 0.0,
}

const nameMapping = {
  handt: "HAND",
  arm1t: "ARM START",
  arm2t: "ARM MIDDLE",
  arm3t: "ARM END",
}

const limits = {
  arm1t: {
    upper: Math.PI * 1.45,
    lower: Math.PI * 1.1,
  },
  arm2t: {
    upper: -Math.PI * 0.7,
    lower: Math.PI * 0.1
  },
  arm3t: {
    upper: -Math.PI * 0.7,
    lower: Math.PI * 0.1
  }
}

const addRandomCommand = () => {
  addCommand(generateRandomCommand())
}

const generateRandomCommand = () => {

  const possibleCommands = ['arm1t', 'arm2t', 'arm3t']

  const name = possibleCommands[Math.floor(Math.random() * possibleCommands.length)]
  const value = Math.random()

  return { name, value }

}

const addCommand = ({ name, value }) => {

  // if (name === "handt") {
  //   value = 1 - animatableParameters.handt
  // }

  const pickUpBall = () => {
    if (name !== "handt") { return }
    if (value === HandCommand.OPEN) { ball.held = false }
    if (
      value === HandCommand.CLOSED
      && dist(lastHandX, lastHandY, ball.x, ball.y) < ball.size
    ) {
      ball.held = true
    }
  }

  const command = gsap.to(animatableParameters, {
    [name]: value,
    duration: 1 + 2 * Math.random(),
    ease: "elastic.inOut(1.2, 0.75)",
    paused: true,
    onComplete: () => {
      activeCommand = null
      pickUpBall()
    }
  })

  command.info = {
    name,
    value,
  }

  commandQueue.push(command)



}

const commandQueue = []

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

const cards = []
function setup() {

  rectMode(CENTER)
  createCanvas(900, 900)

  for (let i = 0; i < 3; i++) {
    const card = new Card(generateRandomCommand())
    card.x = (i + 1) * width / 4
    cards.push(card)
  }

  addRandomCommand()

  t = new Transformer()

  ball = new Ball()

}

let activeCommand = null

function processCommandQueue() {

  if (activeCommand !== null) { return }
  if (commandQueue.length === 0) { return }
  const nextCommand = commandQueue.shift()
  nextCommand.play()
  activeCommand = nextCommand

}

function draw() {

  background(bgColor)

  processCommandQueue()

  // Floor
  fill('grey')
  rect(0, floor + 1000, width * 2, 2000)

  ball.move()
  ball.draw()

  fill('lightgrey')
  stroke('black')
  drawRobotArm()

  fill('white')
  textSize(18)
  text(`Score: ${score}`, 60, 36)

  for (const card of cards) {
    card.draw()
  }

}

function drawRobotArm() {

  const baseX = 700
  const baseY = floor

  const elbowPadding = 10

  const arm1Thickness = 40
  const arm2Thickness = 33
  const arm3Thickness = 22

  const arm1length = 150
  const arm2length = 120
  const arm3length = 180

  const arm1upperLimit = limits.arm1t.upper
  const arm1lowerLimit = limits.arm1t.lower

  const arm2upperLimit = limits.arm2t.upper
  const arm2lowerLimit = limits.arm2t.lower

  const arm3upperLimit = limits.arm3t.upper
  const arm3lowerLimit = limits.arm3t.lower

  const { handt, arm1t, arm2t, arm3t } = animatableParameters

  const arm1Rotation = arm1lowerLimit + arm1t * (arm1upperLimit - arm1lowerLimit)
  const arm2Rotation = arm2lowerLimit + arm2t * (arm2upperLimit - arm2lowerLimit)
  const arm3Rotation = arm3lowerLimit + arm3t * (arm3upperLimit - arm3lowerLimit)

  const handSize = 50

  const handOpen = 1.5
  const handClosed = 0.5

  // const hand_t = ( 1 + Math.sin(frameCount * 0.093) ) / 2

  const handOpenness = lerp(handClosed, handOpen, handt)

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
  const verticalRopes = 10
  const basketDepth = ballSize * 1.2
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

  fill('white')
  stroke('black')
  rect(800, 70, 160, 100)
  noStroke()
  fill('black')
  textAlign(CENTER, CENTER)
  text("OPEN/CLOSE\nHAND", 800, 70)

}

function mousePressed() {

  for (const card of cards) {

    const d = dist(mouseX, mouseY, card.x, card.y)
    if (d < 100) {

      card.activate()

    }

  }

  if (mouseX > 720 && mouseY < 120) {
    addCommand({ name: 'handt', value: 1 - animatableParameters.handt })
  }

}

function sunkBasket() {

  ball.held = false
  score++

  bgColor = 'lightblue'
  window.setTimeout(() => {
    bgColor = 'darkblue'
  }, 200)

}

class Card {

  constructor(command) {

    this.x = 400
    this.y = 700

    this.w = 175
    this.h = 180

    this.setCommand(command)

  }

  setCommand(command) {

    this.command = {}
    this.command.info = command || {
      name: '',
      value: 0,
    }

  }

  activate() {
    addCommand(this.command.info)

    gsap.to(this, {
      y: 1000,
      ease: "power2.in",
      duration: 0.5,
      repeat: 1,
      repeatDelay: 2,
      yoyo: true,
      onRepeat: () => {
        this.setCommand(generateRandomCommand())
      }
    })
  }

  draw() {

    push()

    fill('white')
    stroke('black')
    strokeWeight(2)

    rect(
      this.x,
      this.y,
      this.w,
      this.h
    )

    noStroke()
    fill('black')
    textSize(26)
    textAlign(CENTER, CENTER)
    text(
      `Set\n${nameMapping[this.command.info.name]}\nto\n${getHumanFriendlyValue(this.command.info.name, this.command.info.value)}`,
      this.x,
      this.y
    )

    pop()

  }

}

function getHumanFriendlyValue(name, value) {

  if (name === "handt") {
    if (value === HandCommand.CLOSED) { return "CLOSED" }
    if (value === HandCommand.OPEN) { return "OPEN" }
  }

  const thisLimits = limits[name]
  const v = lerp(thisLimits.lower, thisLimits.upper, value)

  return degrees(v).toFixed(0) + '°'

}