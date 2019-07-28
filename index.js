var pull = require('pull-stream')
var paramap = require('pull-paramap')

require('ssb-client')((err, sbot) => {
  if (err) throw err;

  console.log("Downloading blobs for git updates")

  pull
  (
    sbot.messagesByType({type:"git-update"}),
    paramap((msg, cb) => {
      console.log("getting message")

      var links = []

      if (Array.isArray(msg.value.content.indexes))
        links = links.concat(msg.value.content.indexes)

      if (Array.isArray(msg.value.content.packs)) {
        if (msg.value.content.packs.length == 1 &&
            msg.value.content.packs[0]['pack'] &&
            msg.value.content.packs[0]['idx']) {
          links = links.concat(msg.value.content.packs[0]['pack'])
          links = links.concat(msg.value.content.packs[0]['idx'])
        } else
          links = links.concat(msg.value.content.packs)
      }

      if (Array.isArray(msg.value.content.objects))
        links = links.concat(msg.value.content.objects)

      pull
      (
        pull.values(links),
        paramap((linkObj, cb) => {
          console.log("blob want", linkObj.link)
          sbot.blobs.want(linkObj.link, cb)
        }, 5),
        pull.drain(() => {}, cb)
      )
    }, 1),
    pull.collect((err) => {
      if (err) console.err(err)
      console.log("done")
      sbot.close()
    })
  )
})
