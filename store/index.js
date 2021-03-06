"use strict"
import fetch from "isomorphic-fetch"
import cookie from "js-cookie"
import parser from "cookie"

export const state = () => ({
  authUser: null,
  isAuthenticated: false,
  userinfo: {},
  role: "",
  permissions: [],
  heading: {
    title: "",
    subtitle: ""
  }
})

export const mutations = {
  SET_USER: function (state, user) {
    state.authUser = user.token
    state.userinfo = user.userinfo
    state.isAuthenticated = user.isAuthenticated

  },
  SET_HEAD: function (state, heading) {
    state.heading.title = heading[0]
    state.heading.subtitle = heading[1]
  }
}

export const actions = {
  nuxtServerInit({
    commit
  }, {
    req
  }) {
    if (req) {
      try {
        if (req.headers.cookie) {
          const c = parser.parse(req.headers.cookie)
          const user = c["films_cookie"] ? JSON.parse(c["films_cookie"]) : {
            token: "1"
          }
          if (user.token && user.token.length > 0) {
            commit("SET_USER", user)
          }
        }
      } catch (e) {
        return false
      }
    }
  },
  async login({
    commit
  }, {
    email,
    password
  }) {
    let response = await fetch(`${process.env.baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Accept": "Application/json",
        "Content-Type": "Application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    })
    let result = await response.json()
    // console.log(result)
    // let userData = { token: result.access_token, userinfo: result.userinfo }
    // let userInfo = {userinfo: result.data.fname}
    if (result.success) {
      commit("SET_USER", result.userData)
      cookie.set("films_cookie", result.userData)
    }
  },
  async signup({
    commit
  }, {
    name,
    email,
    password
  }) {
    let response = await fetch(`${process.env.baseUrl}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "Application/json"
      },
      body: JSON.stringify({
        name,
        email,
        password
      })
    })
    let result = await response.json()
    let userData = {
      token: result.success
    }
    commit("SET_USER", userData)
    // cookie.set("photographers_cookie", userData)
  },
  async logout({
    commit, state
  }) {
    let response = await fetch(`${process.env.baseUrl}/auth/logout`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.state.authUser}`
      }
    })
    let result = await response.json()
    if (result.success) {
      commit("SET_USER", {
        userData: {}
      })
      cookie.set("films_cookie", null)
      this.$router.push("/auth/signin");
    }
  }
  /* forgotpassword({ commit }, { email }) {
    return axios.post(`${process.env.baseUrl}/api/user/forgot-password`, {
      email
    })
    .then((res) => {
      return true
    })
    .catch((error) => {
      if (error.response.status === 404) {
        throw new Error('Not found!')
      }
    })
  } */
}
