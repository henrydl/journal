<template>
  <q-page class="q-pa-lg col q-gutter-md">
    <q-card v-if='currentActivity !== null' class='q-pa-md current-activity' :class='"bg-" + currentActivity.category.color + " text-" + currentActivity.category.color'>
      <q-card-section>
        <h4>{{ currentActivity.category.name }}</h4>
        <div class='text-subtitle1'>You've been doing this since {{ this.activeSince }}.</div>
      </q-card-section>
      <q-card-section>
        <p class='text-body1'>{{ messageForYou }}</p>
      </q-card-section>
    </q-card>
    <h5 v-if='currentActivity' class='text-center'>Switch to:</h5>
    <q-card v-else class='q-pa-xl'>
      <h3 class='q-mb-lg'>Your log is empty.</h3>
      <div class='text-subtitle1'>Let's start by picking the activity you're doing right now.</div>
    </q-card>
    <q-card class='q-pa-sm'>
      <q-btn 
        v-for='category in Categories'
        :key="category.name"
        :category='category'
        class='q-ma-sm category-btn' 
        :color='category.name.toLowerCase()' 
        :text-color='category.name.toLowerCase()'
        :icon='category.icon'
        :label='category.name'
        size='lg'
        padding='md lg'
        @click='(ev) => chooseCategory(category, ev)'
        >
        <q-tooltip :delay='800' content-style="font-size: 16px">{{ category.description }}</q-tooltip>
      </q-btn>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import Vue from 'vue';
import moment from 'moment';

import { Activity, Category, Categories } from '../models/activities';
import { putActivity, getScheduleUpToNow, getCurrentActivity} from '../persistence/journal';

export default Vue.extend({
  name: 'TrackerPage',
  components: {  },
  created() {
    const messageCycleInMS = 10000;
    setInterval(this.randomQuote, messageCycleInMS);
    setInterval(this.updateActiveSince, 100);
  },
  data() : { currentActivity: Activity | null, Categories: any, messageForYou: string, activeSince: string} {
    return {
      currentActivity: null,
      Categories,
      messageForYou: "",
      activeSince: ""
    };
  },
  computed: {
    currentActivityTime() {
      
    },
  },
  methods: {
    chooseCategory(category: Category, event: MouseEvent) {
      getCurrentActivity();
      putActivity("exercise");
      getCurrentActivity();
      this.currentActivity = new Activity(category);
      this.randomQuote();
    },
    randomQuote() {
      if (this.currentActivity) {
        const quotes = this.currentActivity.category.quotes;
        const index = Math.floor(rand(0, quotes.length));
        this.messageForYou = quotes[index];
      }
    },
    updateActiveSince() {
      if (!this.currentActivity) return;
      this.activeSince = moment(this.currentActivity.startTime).format('HH:mm') + ', ' + moment.duration(moment().diff(this.currentActivity.startTime)).humanize(true, { s: 5 });
    }
  }
});

function rand(min, max) {
  return Math.random() * (max - min) + min;
}
</script>

<style lang="scss">
  .current-activity {
    box-shadow: 0 0 100px 0 rgba(15, 15, 15, 0.5) inset;
  }

  .category-btn {
    box-shadow: 0 0 10px 0 rgba(15, 15, 15, 0.4) inset;
  }
</style>