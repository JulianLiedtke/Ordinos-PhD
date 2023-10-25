=====
TODOs
=====

The following list contains TODOs, issues, and ideas for further
projects on the Ordinos software.

Translation
===========

The translation uses the `quasar i18n option
<https://quasar.dev/options/app-internationalization>`_ (be aware of
the version this app runs in). The link above provides a tutorial.
There are already some language changes, you can take them as an
example. The options are implemented for app and website but they are
not depended on each other. So every setting has to be changed for
i18n for both of them separately. Examples and explanation from this
point on is done for "the website case". For every new language a
directory needs to created in ``\gui\website\src\i18n\`` and added in
the i18n index file ``\gui\website\src\i18n\index.js``. In every
langauge folder there is a index.js respectively. Every String to be
translated has to be transferred in the index file and added with a
placeholder to the return object. To access the i18n in the components
use ``$t('placholder')``. If a file does not have a placeholder sting
combo the UI displays the placeholder or a string from a different
langauge.

.. note::

  Hints:

  * To change the name of some component you have to make vue compute
    the name, so add a ``:`` in front i.e. ``:label =
    "$t('placeholder')"``. 
  * For better overview add more objects to the return object and name
    them to where they are called. For examples see already translated
    Strings.

Support all Election Types in the UI
====================================

Currently, not all election types are supported in the UI.

Persistent Servers
==================

The data of the server is not persistent. If the server crashes all
information ist lost and one needs to restart all ongoing elections.
