import Vue from 'vue';

const DEFAULT_LANG = 'DEFAULT_LANG';
const storage = new Vue({
  data() {
    let name;

    try {
      name = localStorage.getItem(DEFAULT_LANG);
    } catch (err) {
      // Do nothing
    }

    return {
      selectedLang: name || '',
    };
  },
  methods: {
    updateSelectedLang(name) {
      localStorage.setItem(DEFAULT_LANG, name);

      this.selectedLang = name;
    },
  },
});

export default function enhanceApp({ Vue }) {
  Vue.mixin({
    computed: {
      $selectedLang() {
        return storage.selectedLang;
      },
    },
    beforeCreate() {
      this.$updateSelectedLang = storage.updateSelectedLang;
    },
  });
}
