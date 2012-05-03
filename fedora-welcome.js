#!/usr/bin/env gjs-console

const GdkPixbuf = imports.gi.GdkPixbuf;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;
const Pango = imports.gi.Pango;

let anacondaApp = null;

function makeLabel(label, button) {
    let widget = new Gtk.Label();

    if (button)
        widget.set_markup('<b><span size="x-large" color="white">' + label + '</span></b>');
    else {
        widget.set_line_wrap(true);
        widget.set_justify(Gtk.Justification.CENTER);
        widget.set_margin_top(32);
        widget.set_margin_bottom(32);

        widget.set_markup('<span size="large" color="white">' + label + '</span>');
    }

    return widget;
}

const WelcomeWindow = new Lang.Class({
  Name: 'WelcomeWindow',

  _init: function(application) {
      this.window = new Gtk.ApplicationWindow({ application: application,
                                                type: Gtk.WindowType.TOPLEVEL,
                                                default_width: 600,
                                                default_height: 550,
                                                title: 'Welcome to Fedora',
                                                window_position: Gtk.WindowPosition.CENTER });

      let mainGrid = new Gtk.Grid({ orientation: Gtk.Orientation.VERTICAL,
                                    row_spacing: 16,
                                    vexpand: true,
                                    hexpand: true,
                                    halign: Gtk.Align.CENTER,
                                    valign: Gtk.Align.CENTER });
      this.window.add(mainGrid);

      let buttonBox = new Gtk.Grid({ orientation: Gtk.Orientation.HORIZONTAL,
                                     column_spacing: 16,
                                     halign: Gtk.Align.CENTER });
      mainGrid.add(buttonBox);

      let tryContent = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL,
                                     spacing: 16 });
      tryContent.add(new Gtk.Image({ icon_name: 'media-cdrom',
                                     pixel_size: 256 }));
      tryContent.add(makeLabel('Try Fedora', true));

      let tryButton = new Gtk.Button({ child: tryContent });
      buttonBox.add(tryButton);

      let installContent = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL,
                                         spacing: 16 });

      // provided by the 'fedora-logos' package
      let pix = GdkPixbuf.Pixbuf.new_from_file_at_size(
          '/usr/share/icons/Fedora/scalable/apps/anaconda.svg',
          256, 256);
      installContent.add(new Gtk.Image({ pixbuf: pix }));
      installContent.add(makeLabel(anacondaApp.get_name(), true));

      let installButton = new Gtk.Button({ child: installContent });
      buttonBox.add(installButton);

      this._label = makeLabel('You are currently running Fedora from live media.\n'
                            + 'You can install Fedora now, or choose "Install to Hard Drive"\n'
                            + 'in the Activities overview at any later time.', false);
      mainGrid.add(this._label);

      installButton.connect('clicked', Lang.bind(this,
          function() {
              GLib.spawn_command_line_async('liveinst');
              this.window.destroy();
          }));

      tryButton.connect('clicked', Lang.bind(this,
          function() {
              buttonBox.destroy();
              this._label.destroy();

              let image = new Gtk.Image({ file: './install-button.png',
                                          halign: Gtk.Align.CENTER });
              mainGrid.add(image);

              this._label = makeLabel('You can choose "Install to Hard Drive"\n'
                                    + 'in the Activities overview at any later time.', false);
              mainGrid.add(this._label);

              let closeLabel = makeLabel('Close', true);
              closeLabel.margin = 10;
              let button = new Gtk.Button({ child: closeLabel,
                                            halign: Gtk.Align.CENTER });
              button.connect('clicked', Lang.bind(this,
                  function() {
                      this.window.destroy();
                  }));
              mainGrid.add(button);

              mainGrid.show_all();
          }));
  }
});

Gtk.init(null, null);
Gtk.Settings.get_default().gtk_application_prefer_dark_theme = true;

// provided by the 'anaconda' package
anacondaApp = Gio.DesktopAppInfo.new('anaconda.desktop');
if (!anacondaApp)
    anacondaApp = Gio.DesktopAppInfo.new('liveinst.desktop');

if (anacondaApp) {
    let application = new Gtk.Application({ application_id: 'org.fedoraproject.welcome-screen',
                                            flags: Gio.ApplicationFlags.FLAGS_NONE });
    let welcomeWindow = null;

    application.connect('startup', Lang.bind(this,
        function() {
            welcomeWindow = new WelcomeWindow(application);
        }));
    application.connect('activate', Lang.bind(this,
        function() {
            welcomeWindow.window.show_all();
        }));

    application.run(ARGV);
}
