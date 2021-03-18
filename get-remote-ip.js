function getRemoteIP(request) {
    return request.header('cf-connecting-ip') || request.ip || '未知IP';
}

module.exports = getRemoteIP;
