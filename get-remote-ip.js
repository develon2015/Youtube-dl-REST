function getRemoteIP(request) {
    return request.header('cf-connecting-ip') || '127.0.0.1';
}

module.exports = getRemoteIP;