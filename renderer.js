const rowserWindow = require('electron')

$('button').on('click',function(){
    const myNotification = new Notification('Title', {
        body: 'Notification from the Renderer process'
      });
      

})