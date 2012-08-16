
(function() {

  /**
   * manages all the wizards which render carto
   */
  cdb.admin.mod.CartoWizard = cdb.core.View.extend({

    events: {
      'click li a': '_changeWizard'
    },

    initialize: function() {
      var self = this;
      this.cartoStylesGeneration = new cdb.admin.CartoStyles({
        table: this.options.table
      });

      this.panels = new cdb.ui.common.TabPane();
    },

    activated: function() {
      var self = this;
      // this is the sole entry point where the catocss in changed
      // wizards only should change cartoStylesGeneration model
      this.cartoStylesGeneration.bind('change:style', function() {
        self.model.set('tile_style', this.get('style'));
      });
    },

    deactivated: function() {
      this.cartoStylesGeneration.unbind(null, null, this);
    },

    render: function() {
      this.$el.append(this.getTemplate('table/menu_modules/views/carto_wizard')());
      this.panels.setElement(this.$('.forms'));

      // render the wizards
      this.panels.addTab('simple', new SimpleWizard({
        model: this.cartoStylesGeneration
      }).render());

      this.panels.addTab('bubble', new BubbleWizard({
        model: this.cartoStylesGeneration,
        table: this.options.table
      }).render());

      this.panels.addTab('choropleth', new ChoroplethWizard({
        model: this.cartoStylesGeneration,
        table: this.options.table
      }).render());

      return this;
    },

    _changeWizard: function(e) {
      e.preventDefault();
      var what = $(e.target).html();
      this.panels.active(what);
      return false;
    }

  });

  /**
   * simple wizard tab
   * take this as base for other wizards
   */
  var SimpleWizard = cdb.core.View.extend({

    initialize: function() {
      var self = this;
      this.cartoProperties = new Backbone.Model();

      this.form = new cdb.forms.Form({
        form_data: this.options.form || cdb.admin.forms.simple_form,
        model: this.cartoProperties
      });

      this.cartoProperties.bind('change', function() {
        self.model.set({ properties: _.clone(self.cartoProperties.attributes) });
      });
    },

    render: function() {
      this.$el.html('');
      this.$el.append(this.form.render().el);
      return this;
    }

  });

  /**
   * bubble
   */
  var BubbleWizard = SimpleWizard.extend({

    initialize: function() {
      this.options.form = cdb.admin.forms.bubble_form;

      this.setFormProperties();

      this.model.registerGenerator('bubble', bubble_generator);
      this.model.set( {'type': 'bubble'}, {silent: true});
      SimpleWizard.prototype.initialize.call(this);

      this.add_related_model(this.options.table);
      this.options.table.bind('change:schema', function() {
        this.setFormProperties();
        this.render();
      }, this);
    },

    setFormProperties: function() {
      var b = this.options.form[0].form.property.extra = this.options.table.columnNames();
      this.options.form[0].form.property.value = b[0];
    }

  });

  cdb._BubbleWizard = BubbleWizard;

  /**
   * choroplet
   */
  var ChoroplethWizard = SimpleWizard.extend({

    initialize: function() {
      this.options.form = cdb.admin.forms.choroplet;

      this.setFormProperties();

      //this.model.registerGenerator('bubble', bubble_generator);
      //this.model.set( {'type': 'bubble'}, {silent: true});
      SimpleWizard.prototype.initialize.call(this);

      this.add_related_model(this.options.table);
      this.options.table.bind('change:schema', function() {
        this.setFormProperties();
        this.render();
      }, this);
    },

    setFormProperties: function() {
      var b = this.options.form[0].form.property.extra = this.options.table.columnNames();
      this.options.form[0].form.property.value = b[0];
    }

  });

  //cdb._BubbleWizard = BubbleWizard;




})();