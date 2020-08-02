
// eventBus for communication between components that aren't direct decendents
var eventBus = new Vue()

// product component
Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
   <div class="product">
        
      <div class="product-image">
        <img :src="image" />
      </div>

      <div class="product-info">
          <h1>{{ title }}</h1>
          <p v-if="inStock">In Stock</p>
          <p v-else>Out of Stock</p>

          <p>Shipping: {{ shipping }}</p>

          <product-details :details="details"></product-details>

          <div class="color-box"
               v-for="(variant, index) in variants" 
               :key="variant.variantId"
               :style="{ backgroundColor: variant.variantColor }"
               @mouseover="updateProduct(index)"
               >
          </div> 

          <button v-on:click="addToCart" 
            :disabled="!inStock"
            :class="{ disabledButton: !inStock }"
            >
          Add to cart
          </button>

          <button v-on:click="removeFromCart" :disabled="!inStock"
          :class="{disabledButton: !inStock}">
              Remove From cart 
          </button>
 
          <product-tabs :reviews="reviews"></product-tabs>

       </div>  

    
    </div>
   `,
    data() {
        return {
            product: 'Socks',
            brand: 'Vue Mastery',
            selectedVariant: 0,
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: 'greenSocks.jpg',
                    variantQuantity: 10
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: 'blueSocks.jpg',
                    variantQuantity: 9
                }
            ],
            reviews: []
        }
    },
    methods: {
        addToCart: function () {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
        },
        removeFromCart: function () {
            this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId)
        },
        updateProduct: function (index) {
            this.selectedVariant = index
        }   
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product
        },
        image() {
            return this.variants[this.selectedVariant].variantImage
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity
        },
        shipping() {
            if (this.premium) {
                return "Free"
            }
            return 2.99
        }   
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    }
})


// product-review component
Vue.component('product-review', {
    template: `
        <form class="review-form" @submit.prevent="onSubmit">
            <p>
                <label for="name">Name: </label>
                <input v-model="name" placeholder="name">
            </p>
            
            <p>
                <label for="review">Review: </label>
                <textarea id="review" v-model="review"></textarea>
            </p>

            <p>
                <label for="rating">Rating: </label>
                <select id="rating" v-model.number="rating">
                    <option>5</option>
                    <option>4</option>
                    <option>3</option>
                    <option>2</option>
                    <option>1</option>
                </select>
            </p>

            

            <p>
                <input type="submit" value="Submit">
            </p>

            <p v-if="errors.length">
                <b>Please correct the above error(s):</b>
                <ul>
                    <li v-for="error in errors">{{ error }}</li>
                </ul>
            </p>

        </form>
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            errors: []
        }
    },
    methods: {
        onSubmit() {
            this.errors = [];
            if(this.name && this.review && this.rating){
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
            }else{
                if(!this.name) this.errors.push("Name required.")
                if(!this.review) this.errors.push("Review required.")
                if(!this.rating) this.errors.push("Rating required.")
            }
        }
    }
})

// product-details component
Vue.component('product-details', {
    props: {
        details: {
            type: Array,
            required: true
        }
    },
    template: `
    <ul>
      <li v-for="detail in details">{{ detail }}</li>
    </ul>
  `
})

// product-tabs component
Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false
        }
    },
    template:`
        <div>
            <ul>
                <span :class="{ activeTab: selectedTab === tab }" 
                v-for="(tab, index) in tabs" 
                @click="selectedTab = tab" 
                :key="index">{{ tab }}</span>
            </ul>

            <div v-show="selectedTab === 'Review'">
              <p v-if="!reviews.length">There are no reviews yet.</p>
              <ul v-else>
                  <li v-for="(review, index) in reviews" :key="index">
                      <p>{{ review.name }}</p>
                      <p>Rating: {{ review.rating }}</p>
                      <p>{{ review.review }}</p>
                  </li>
              </ul>
            </div>

            <div v-show="selectedTab === 'Make a Review'">
                <product-review></product-review>
            </div>
        </div>
    `,
    data(){
        return{
            tabs: ['Reviews', 'Make a Review'],
            selectedTab: 'Reviews'
        }
    }
})





//root
var app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        updateCart(id){
            this.cart.push(id)
        },
        removeFromCart(id) {
            const index = this.cart.indexOf(id);
            if(index > -1){
                this.cart.splice(index, 1);
            }
        }
    }
})