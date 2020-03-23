const config = require('./config')
const d = require('fastify')({logger: true})
const fetch = require('node-fetch')

let token = config.token

const telegram_endpoint = 'https://api.telegram.org/bot' + token

d.get('/status', (req, reply) => {
  reply.code(200).send({ok: 0, msg: 'ok'})
})

d.post('/', async (req, reply) => {
  try {
    console.log(req.body.message)
    if (typeof req.body.message !== 'undefined' && typeof req.body.message.text !== 'undefined') {
      let replyto = null
      if (typeof req.body.message.chat !== 'undefined') {
        replyto = req.body.message.chat.id
      }
      let text = req.body.message.text
      let parsed = req.body.message.text.split(' ')
      if (text.toLowerCase().trim() === 'tell me a joke') {
        let res = await fetch('https://sv443.net/jokeapi/v2/joke/Dark')
        let response = await res.json()
        if (response.type === 'twopart') {
          let text_response = response.setup
          res = await fetch(telegram_endpoint + '/sendMessage?chat_id=' + replyto + '&text=' + text_response)
          text_response = response.delivery
          setTimeout(() => {sendMessage(telegram_endpoint, replyto, text_response)}, 4000)
        } else {
          let text_response = response.joke
          res = await fetch(telegram_endpoint + '/sendMessage?chat_id=' + replyto + '&text=' + text_response)
        }

      }
      if (parsed[0] === 'whatis') {
        if (parsed.length > 1) {
          let name = ''
          let i = 1
          while (i < parsed.length) {
            name += parsed[i] + '%20'
            i++
          }
          name = name.slice(0, -3)
          let response = await getNameOrigin(name)
          let pronoun = response.gender==='male'?'His':'Her'
          let text_response = pronoun + ' name is: ' + response.ethnicity + '/' + response.gender + '. P(ethnicity)=' + response['ethnicity probability']*100 + '% P(gender)=' + response['gender probability']*100 + '%'
          res = await fetch(telegram_endpoint + '/sendMessage?chat_id=' + replyto + '&text=' + text_response)
        }
      }
      if (text.toLowerCase().trim() === 'whatami') {
        let name = req.body.message.from.first_name + '%20' + req.body.message.from.last_name
        let response = await getNameOrigin(name)
        let text_response = 'Your name is: ' + response.ethnicity + '/' + response.gender + '. P(ethnicity)=' + response['ethnicity probability']*100 + '% P(gender)=' + response['gender probability']*100 + '%'
        res = await fetch(telegram_endpoint + '/sendMessage?chat_id=' + replyto + '&text=' + text_response)
      }
    }
    reply.code(200).send({ok:0, msg: 'ok'})
  } catch(e) {
    console.log(e)
    reply.code(200).send()
  }
})

d.listen(6666, '0.0.0.0', (err, address) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})

getNameOrigin = async (name) => {
  try {
    let res = await fetch('https://api.diversitydata.io/?fullname=' + name,
        {
          method: 'GET',
          headers: {
            "Accept":"application/json"
          }
        }
      )
    let response = await res.json()
    console.log(response)
    return response
  } catch(e) {
    console.log(e)
    throw new Error(e)
  }
}

sendMessage = async (telegram_endpoint, replyto, text_response) => {
  try {
    let res = await fetch(telegram_endpoint + '/sendMessage?chat_id=' + replyto + '&text=' + text_response)
    return res
  } catch(e) {
    console.log(e)
    throw new Error(e)
  }
}
