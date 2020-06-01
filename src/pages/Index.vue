<template>
  <q-page class="q-pa-lg col q-gutter-md">
    <q-card v-if='currentActivity !== null' class='q-pa-md'>
      <q-card-section>
        <h4>{{ currentActivity.category.name }}</h4>
        <div class='text-subtitle1'>Active since: </div>
      </q-card-section>
      <q-card-section>
        <p>Hey, this is a message just for you, about whatever you're doing!</p>
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
        class='q-ma-sm' 
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

import { Activity, Category, Categories } from '../models/activities';
import { putActivity, getScheduleUpToNow, getCurrentActivity} from '../persistence/journal';

export default Vue.extend({
  name: 'TrackerPage',
  components: {  },
  data() : { currentActivity: Activity | null, Categories: any} {
    return {
      currentActivity: null,
      Categories
    };
  },
  methods: {
    chooseCategory: function (category: Category, event: MouseEvent) {
      getCurrentActivity();
      putActivity("exercise");
      getCurrentActivity();
      console.log(this);
      this.currentActivity = new Activity(category);
    }
  }
});
</script>
