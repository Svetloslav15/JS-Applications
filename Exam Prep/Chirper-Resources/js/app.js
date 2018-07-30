$(() => {
   let app = Sammy('#main', function () {
       this.use("Handlebars", 'hbs');

       this.get('index.html', function () {

       });
   });

   app.run();
});