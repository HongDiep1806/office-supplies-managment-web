<template>
  <div class="sidebar"
       :style="sidebarStyle"
       :data-color="backgroundColor"
       :data-image="backgroundImage">
    <div class="sidebar-wrapper">
      <div class="logo" style="background-color: rgb(106, 42, 91) !important;">
        <a href="#" class="simple-text logo__container">
            <div>
                <img  style="width: 100%;height: 20%;" src="https://i0.wp.com/www.globalatlanta.com/wp-content/uploads/Becamex.png?fit=786%2C168&ssl=1" alt="">
            </div>
          <!-- {{title}} -->
        </a>
      </div>

      <slot name="content" style="background-color: rgb(106, 42, 91) !important;"></slot>
      <ul class="nav nav-main__links"
      style="background-color: rgb(114, 45, 99) !important;">
        <!--By default vue-router adds an active class to each route link. This way the links are colored when clicked-->
        <slot>
          <sidebar-link v-for="(link,index) in sidebarLinks"
                        :key="link.name + index"
                        :to="link.path"
                        @click="closeNavbar"
                        :link="link">
            <i :class="link.icon"></i>
            <p>{{link.name}}</p>
          </sidebar-link>
        </slot>
      </ul>
      <ul class="nav nav-bottom" v-if="$slots['bottom-links']" style="background-color: rgb(114, 45, 99) !important;">
        <slot name="bottom-links"></slot>
      </ul>
    </div>
  </div>
</template>
<script>
  import SidebarLink from './SidebarLink.vue'

  export default {
    components: {
      SidebarLink
    },
    props: {
      title: {
        type: String,
        default: 'Vue LBD'
      },
      backgroundColor: {
        type: String,
        default: 'black',
        validator: (value) => {
          let acceptedValues = ['', 'blue', 'azure', 'green', 'orange', 'red', 'purple', 'black']
          return acceptedValues.indexOf(value) !== -1
        }
      },
      backgroundImage: {
        type: String,
        default: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAVq1P2OHjnVqe0OlJvwNklxVDEh-rYkb7Yg&s'
      },
      activeColor: {
        type: String,
        default: 'success',
        validator: (value) => {
          let acceptedValues = ['primary', 'info', 'success', 'warning', 'danger']
          return acceptedValues.indexOf(value) !== -1
        }
      },
      sidebarLinks: {
        type: Array,
        default: () => []
      },
      autoClose: {
        type: Boolean,
        default: true
      }
    },
    provide () {
      return {
        autoClose: this.autoClose
      }
    },
    computed: {
      sidebarStyle () {
        return {
          backgroundImage: `url(${this.backgroundImage})`
        }
      }
    }
  }

</script>
<style>
  .sidebar .sidebar-wrapper {
    display: flex;
    flex-direction: column;
  }
 .sidebar .nav-main__links {
   flex: 1;
 }
 .sidebar .sidebar-wrapper .logo .logo__container {
   padding-left: 10px;
 }
</style>
