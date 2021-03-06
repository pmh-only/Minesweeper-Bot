const setting = require('./setting.json')
const { Client, MessageEmbed } = require('discord.js')
const client = new Client()
const prefix = '!'

const deadEmbed = new MessageEmbed().setTitle(':boom:펑!').setDescription('퍼어엉~!\n아쉽네요.. 다음번에 도전하시길..')
const arr = create2DArray(10, 10)
let bomb = 0

const spoiler = (str) => `||${str}||`
const int2Emoji = (int) => [':zero:', ':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', ':eight:', ':bomb:'][int]
const dead = (msg) => msg.channel.send(deadEmbed)

function plusArr (i, j) {
  if (
    (i >= 0 && i <= 9) && (j >= 0 && j <= 9) &&
    (!(arr[i][j] === 9))) arr[i][j]++
}

client.on('ready', () => console.log('--Start--'))
client.on('message', (msg) => {
  if (msg.author.bot) return
  if (msg.content !== `${prefix}start`) return

  msg.channel.send(new MessageEmbed()
    .setTitle(':boom:지뢰찾기')
    .setDescription('지뢰찾기 모드를 골라주세요!\n1. 스포일러 모드\n2. 확인 모드'))
    .then(async (m) => {
      m.react('1️⃣')
      m.react('2️⃣')
      const reaction = (await m.awaitReactions((r, u) => u.id === msg.author.id && ['1️⃣', '2️⃣'].includes(r.emoji.name), { max: 1 })).first().emoji.name
      if (reaction === '1️⃣') spoilerMode(m)
      if (reaction === '2️⃣') confirmMode(m)
    })

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) arr[i][j] = 0
  }

  // Create Bomb and Avoid duplication
  for (let i = 0; i < 10; i++) {
    const x = Math.floor(Math.random() * 10)
    const y = Math.floor(Math.random() * 10)
    if (arr[x][y] === 9) i--
    else {
      arr[x][y] = 9
      bomb++
    }
  }

  // Increase elements around the bomb
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      if (arr[i][j] === 9) {
        plusArr(i + 1, j)
        plusArr(i + 1, j + 1)
        plusArr(i + 1, j - 1)
        plusArr(i - 1, j)
        plusArr(i - 1, j + 1)
        plusArr(i - 1, j - 1)
        plusArr(i, j + 1)
        plusArr(i, j - 1)
      }
    }
  }
})

client.login(setting.token)
// client.login(process.env.token)

function create2DArray (rows, columns) {
  const arr = new Array(rows)
  for (let i = 0; i < rows; i++) arr[i] = new Array(columns)
  return arr
}

// Spoiler Mode
function spoilerMode (msg) {
  let description = ''

  for (let i = 0; i < 10; i++) {
    // eslint-disable-next-line curly
    for (let j = 0; j < 10; j++)
      description += arr[i][j] === 0 ? int2Emoji(0) : spoiler(int2Emoji(arr[i][j]))
    description += '\n'
  }
  description += `\\💣 : ${bomb}개`
  msg.channel.send(new MessageEmbed({ title: '지뢰찾기 (스포일러 모드)', description }))
}

// Confirm Mode
function confirmMode (msg) {
  msg.channel.send(new MessageEmbed({ title: '지뢰찾기 (확인 모드)', description: '`!확인 (x좌표) (y좌표)`로 그 곳이 어느 숫자인지 살펴보세요!' }))
  const filter = m => m.content.startsWith(`${prefix}확인`)
  const collector = msg.channel.createMessageCollector(filter, { time: 150000 })
  collector.on('collect', m => {
    if (arr[m.content.split(' ')[2]][m.content.split(' ')[1]] === 9) {
      dead(msg)
      return
    }
    m.channel.send(int2Emoji(arr[m.content.split(' ')[2]][m.content.split(' ')[1]]))
  })

  collector.on('end', () => {
    msg.channel.send(new MessageEmbed()
      .setTitle('끝')
      .setDescription('끝입니다'))
  })
}
