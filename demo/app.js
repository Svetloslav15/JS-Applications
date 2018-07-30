$(() =>{
    const app = Sammy('#main', function () {
        this.use("Handlebars", "hbs");

        this.get('contact', function () {
           this.swap('<h2>Contact book</h2>');
        });

        this.get('about', function () {
           this.swap('<h2>About page</h2>')
        });

        this.get('#/index.html', function() {
            this.name = "Svetloslav";
            this.partial('template.hbs');
        });
    });

    app.run();
});