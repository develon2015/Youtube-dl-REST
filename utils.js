function getRemoteIP(request) {
    return request.header('cf-connecting-ip') || request.ip || '未知IP';
}

function getWebsiteUrl(website, id) {
    switch (website) {
        case 'y2b':
            return `https://youtu.be/${id}`;
        case 'bilibili':
            return `https://www.bilibili.com/video/${id}`;
    }
}

module.exports = {
    getRemoteIP,
    getWebsiteUrl,
}
