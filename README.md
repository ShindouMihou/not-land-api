# Not Land API

Based on the implementation of `is-sea` library, this public API can be used to 
determine whether a given coordinate is located in the sea or on land. 

**Less talk, one code example:**
```javascript
// Note: 128/s ratelimit applies for this public API
fetch('https://not-land.mihou.dev/?lat=37.7749&lon=-122.4194')
  .then(response => response.json())
  .then(data => {
    if (data.areWeInSea) {
      console.log('The coordinate is in the sea.');
    } else {
      console.log('The coordinate is on land.');
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
```


## Credits

This API runs on the logic created by the [is-sea](https://github.com/simonepri/is-sea/tree/master) library 
but just expanded to a public API for easier access with a 1m resolution.