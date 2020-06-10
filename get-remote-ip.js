function getRemoteIP(request) {
    return request.header('cf-connecting-ip') || '未知IP';
}

module.exports = getRemoteIP;
