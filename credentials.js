var mongolabUri = 'mongodb://<user>:<host>:<port>/<db>'
module.exports.mongolabUri = (process.env.MONGOLAB_URI ? process.env.MONGOLAB_URI : mongolabUri) ;