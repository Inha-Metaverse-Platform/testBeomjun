module.exports = {
  HTML:function(title, list, body, control){
    return `
    <!doctype html>
    <html>
    <head>
      <title>${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">HOME</a></h1>
      ${list}
      ${control}
      ${body}
    </body>
    </html>
    `;
  },
  list:function(accounts){
    var list = '<ul>';
    var i = 0;
    while(i < accounts.length){
      list = list + `<li><a href="/account/${accounts[i].id}">${accounts[i].username}</a></li>`;
      i = i + 1;
    }
    list = list+'</ul>';
    return list;
  },
  addList:function(accounts){
    for(account in accounts) {
      var liArea = document.getElementById('accountlist');
      var newLI = document.createElement("li");
      newLI.innerHTML = `<a href="/account/${account.id}">${account.username}</a>`

      liArea.appendChild(newLI);
    }

  }
}




// module.exports = {
//   HTML:function(title, list, body, control){
//     return `
//     <!doctype html>
//     <html>
//     <head>
//       <title>${title}</title>
//       <meta charset="utf-8">
//     </head>
//     <body>
//       <h1><a href="/">HOME</a></h1>
//       ${list}
//       ${control}
//       ${body}
//     </body>
//     </html>
//     `;
//   },
//   list:function(accounts){
//     var list = '<ul>';
//     var i = 0;
//     while(i < accounts.length){
//       list = list + `<li><a href="/?id=${accounts[i].id}">${accounts[i].username}</a></li>`;
//       i = i + 1;
//     }
//     list = list+'</ul>';
//     return list;
//   }
// }
