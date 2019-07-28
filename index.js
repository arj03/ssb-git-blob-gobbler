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
      pull
      (
	pull.values(msg.value.content.indexes.concat(msg.value.content.packs)),
	paramap((linkObj, cb) => {
	  console.log("blob want", linkObj.link)
	  sbot.blobs.want(linkObj.link, cb)
	}, 5),
	pull.drain(() => {}, cb)
      )
    }, 1),
    pull.collect(() => {
      console.log("done")
      sbot.close()
    })
  )
})
	      

