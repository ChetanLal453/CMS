import { configureStore, combineReducers } from '@reduxjs/toolkit';

// Dummy reducer since no actual reducers are used
const dummyReducer = (state = {}, action) => state;

// Combine reducers (even if empty, but we need at least one)
const rootReducer = combineReducers({
  dummy: dummyReducer,
});

const store = configureStore({
  reducer: rootReducer,
});

export default store;
