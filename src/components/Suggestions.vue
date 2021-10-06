<template>
  <!--Functions, Methods-->
  <div v-if="suggestions.type !== 'signals'" class="grid grid-cols-5 h-full">
    <div class="col-span-1 h-full overflow-y-auto bg-white">
      <div
        v-for="(suggestion, index) in suggestions.list"
        :key="suggestion.key"
        :ref="'suggested-item-' + index"
        class="px-4 py-1.5 cursor-default"
        @mouseover="$emit('update:selected', index)"
        @mousemove="blockAutoScroll"
        @click="$emit('selected')"
        :class="{
          'bg-blue-100': index === selected,
        }"
      >
        {{ suggestion.name }}
      </div>
    </div>

    <!--Documentation-->
    <div
      class="col-span-4 h-full p-4 overflow-y-auto text-sm bg-gray-100"
      v-if="selectedSuggestion !== null"
    >
      <documentation
        v-if="selectedSuggestion !== null"
        :func="selectedSuggestion"
      />
    </div>
  </div>

  <!--Signals-->
  <div v-else class="h-full overflow-y-auto">
    <div
      v-for="(signal, index) in suggestions.list"
      :key="signal.id"
      :ref="'suggested-item-' + index"
      class="bg-white px-4 py-1.5 cursor-default grid grid-cols-5"
      @mouseover="$emit('update:selected', index)"
      @mousemove="blockAutoScroll"
      @click="$emit('selected')"
      :class="{
        'bg-blue-100': index === selected,
      }"
    >
      <div class="col-span-2 overflow-ellipsis">{{ signal.id }}</div>
      <div class="col-span-1 overflow-ellipsis">{{ signal.type }}</div>
      <div class="col-span-1 overflow-ellipsis">
        {{ signal.unitName }}
      </div>
      <div class="col-span-1 overflow-ellipsis">
        {{ signal.unitSymbol }}
      </div>
    </div>
  </div>
</template>

<script>
import Documentation from "./Documentation.vue";

export default {
  components: {
    Documentation,
  },

  props: {
    suggestions: {
      default: null,
    },

    selected: {
      default: 0,
    },
  },

  emits: ["update:selected", "selected"],

  data() {
    return {
      autoScrollIsBlocked: false,
      timeout: null,
    };
  },

  watch: {
    selected: {
      handler(newValue, oldValue) {
        if (this.autoScrollIsBlocked) return;
        //scroll selected into view
        this.$refs["suggested-item-" + this.selected].scrollIntoView({
          block: newValue > oldValue ? "end" : "start",
          behavior: "smooth",
        });
      },
    },
  },

  computed: {
    selectedSuggestion() {
      return this.suggestions === null || this.suggestions.list.length == 0
        ? null
        : {
            spec: this.suggestions.list[this.selected],
            type: this.suggestions.type,
          };
    },
  },

  methods: {
    blockAutoScroll() {
      this.autoScrollIsBlocked = true;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(
        function () {
          this.autoScrollIsBlocked = false;
        }.bind(this),
        500
      );
    },
  },
};
</script>