/**
 * Converts a long string of bytes into a readable format e.g KB, MB, GB, TB, YB
 * 
 * @param {Int} num The number of bytes.
 */
function readableBytes(bytes) {
    var i = Math.floor(Math.log(bytes) / Math.log(1024)),
        sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    return (bytes / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + sizes[i];
}

const confirmBtn = $('.mini.confirm.modal .positive.button')

function showConfirm(title, content, callFn, extData) {
    const modal = $('.mini.confirm.modal')
    modal.children('.header').text(title)
    modal.children('.content').text(content)
    if (confirmBtn.hasClass('loading')) {
        return false
    }
    modal.modal({
        closable: true,
        onApprove: function () {
            confirmBtn.toggleClass('loading')
            callFn(extData)
            return false
        }
    }).modal('show')
}

function showFormModal(modelSelector, formID, URL, getData) {
    $(modelSelector).modal({
        closable: true,
        onApprove: function () {
            let success = false
            const btn = $(modelSelector + ' .positive.button')
            const form = $(modelSelector + ' form')
            if (btn.hasClass('loading')) {
                return success
            }
            form.children('.message').remove()
            btn.toggleClass('loading')
            const data = getData ? getData() : $(formID).serializeArray().reduce(function (obj, item) {
                obj[item.name] = (item.name.endsWith('_id') || item.name === 'id') ? parseInt(item.value) : item.value;
                return obj;
            }, {});
            $.post(URL, JSON.stringify(data)).done(function (resp) {
                if (resp.code == 200) {
                    if (resp.message) {
                        $.suiAlert({
                            title: '操作成功',
                            type: 'success',
                            description: resp.message,
                            time: '3',
                            position: 'top-center',
                        });
                    }
                    window.location.reload()
                } else {
                    form.append(`<div class="ui negative message"><div class="header">操作失败</div><p>` + resp.message + `</p></div>`)
                }
            }).fail(function (err) {
                form.append(`<div class="ui negative message"><div class="header">网络错误</div><p>` + err.responseText + `</p></div>`)
            }).always(function () {
                btn.toggleClass('loading')
            });
            return success
        }
    }).modal('show')
}

function addOrEditServer(server) {
    const modal = $('.server.modal')
    if (server) {
        server = JSON.parse(server)
    }
    modal.children('.header').text((server ? '修改' : '添加') + '服务器')
    modal.find('.positive.button').html(server ? '修改<i class="edit icon"></i>' : '添加<i class="add icon"></i>')
    modal.find('input[name=id]').val(server ? server.ID : null)
    modal.find('input[name=name]').val(server ? server.Name : null)
    if (server) {
        modal.find('.secret.field').attr('style', '')
        modal.find('input[name=secret]').val(server.Secret)
    } else {
        modal.find('.secret.field').attr('style', 'display:none')
        modal.find('input[name=secret]').val('')
    }
    showFormModal('.server.modal', '#serverForm', '/api/server')
}

function deleteRequest(api) {
    $.ajax({
        url: api,
        type: 'DELETE',
    }).done(resp => {
        if (resp.code == 200) {
            if (resp.message) {
                alert(resp.message)
            } else {
                alert('删除成功')
            }
            window.location.reload()
        } else {
            alert('删除失败 ' + resp.code + '：' + resp.message)
            confirmBtn.toggleClass('loading')
        }
    }).fail(err => {
        alert('网络错误：' + err.responseText)
    });
}

function logout(id) {
    $.post('/api/logout', JSON.stringify({ id: id })).done(function (resp) {
        if (resp.code == 200) {
            $.suiAlert({
                title: '注销成功',
                type: 'success',
                description: '如需继续访问请使用 GitHub 再次登录',
                time: '3',
                position: 'top-center',
            });
            window.location.reload()
        } else {
            $.suiAlert({
                title: '注销失败',
                description: resp.code + '：' + resp.message,
                type: 'error',
                time: '3',
                position: 'top-center',
            });
        }
    }).fail(function (err) {
        $.suiAlert({
            title: '网络错误',
            description: err.responseText,
            type: 'error',
            time: '3',
            position: 'top-center',
        });
    })
}
