$(document).ready(function () {
  $.ajax({
    url: '/getAllUsers',
    type: 'GET',
    success: function (users) {
      for (let i = 0; i < users.data.length; i++) {
        let user = users.data[i]
        userTable.row.add(user).draw()
      }
    },
  })

  
var userTable = $('#userTable').DataTable({
  columnDefs: [{ orderable: false, targets: [5] }],
  columns: [
    { data: 'access_token' },
    { data: 'mt_username' },
    { data: 'symbol' },
    { data: 'fund' },
    { 
        data: 'status',
        render: function(data, type, row) {
            return data === 'Play' ? 'Running' : 'Stopped';
        }
    },
    {
        data: null,
        defaultContent: '',
        render: function (data, type, row) {
            let iconClass = data.status === 'Pause' ? 'fa-play' : 'fa-pause'
            return (
                '<button class="btn btn-default statusBtn"><i class="fas ' +
                iconClass +
                '"></i></button> \
                <button class="btn btn-danger delBtn"><i class="fas fa-trash"></i></button>'
            )
        },
    },
  ],
})

  $('#userForm').on('submit', function (e) {
    e.preventDefault()

    var form_data = $('#userForm').serialize()

    $.ajax({
      type: 'POST',
      url: '/',
      data: form_data,
      success: function (data) {
        // Convert form data to JSON
        var data_json = {}
        $(form_data.split('&')).each(function (index, obj) {
          var pair = obj.split('=')
          data_json[pair[0]] = decodeURIComponent(pair[1]).replace(/\+/g, ' ')
        })

        userTable.row
          .add({
            access_token: data_json['access_token'],
            mt_username: data_json['mt_username'],
            symbol: data_json['symbol'],
            fund: data_json['fund'],
            status: 'Pause',
          })
          .draw(false)
      },
      error: function (error) {
        console.log(error)
      },
    })

    // Clear form fields after submission
    $('#userForm').get(0).reset()
  })

  $('#userTable tbody').on('click', 'button.statusBtn', function () {
    var data = userTable.row($(this).parents('tr')).data()
    var id = data.access_token
    var btn = $(this)
    if (id !== 'undefined') {
      $.ajax({
        url: '/status/' + id,
        type: 'POST',
        success: function (res) {
          data.status = res.status
          let iconClass = res.status === 'Pause' ? 'fa-play' : 'fa-pause'
          btn.html('<i class="fas ' + iconClass + '"></i>')
          userTable.row(btn.parents('tr')).data(data).draw()
        },
      })
    }
  })
  $('#userTable tbody').on('click', 'button.delBtn', function () {
    var btn = $(this)
    var data = userTable.row(btn.parents('tr')).data()
    var id = data.access_token
    if (id !== 'undefined') {
      $.ajax({
        url: '/delete/' + id,
        type: 'DELETE',
        success: function (result) {
          // remove the corresponding row in the DataTable.
          userTable.row(btn.parents('tr')).remove().draw()
        },
      })
    }
  })

  $('.statusBtn').click(function () {
    var id = $(this).attr('id').split('-')[1]
    if ($(this).text() === 'Play') {
      $(this).text('Pause')
    } else {
      $(this).text('Play')
    }
  })

  $('.delBtn').click(function () {
    var id = $(this).attr('id').split('-')[1]
    // AJAX call to delete entry
    $.ajax({
      url: '/delete/' + id,
      type: 'DELETE',
      success: function (result) {
        $('#tr-' + id).remove()
      },
    })
  })
})

$('.statusBtn').click(function () {
  var id = $(this).attr('id').split('-')[1]
  var btn = $(this)
  // AJAX call to switch status
  $.post('/status/' + id, function (data) {
    btn.text(data.status)
  })
})

setInterval(function () {
  // call a function that checks the status message for all users
  checkStatusMessage()
}, 1000)

function checkStatusMessage() {
  var data = userTable.rows().data()
  data.each(function (value, index) {
    $.get('/status_message/' + value.access_token, function (msg) {
      // Display a notification with the status message
      // This can be customised as per need.
      alert('Status for ' + value.mt_username + ' : ' + msg.status_message)
    })
  })
}