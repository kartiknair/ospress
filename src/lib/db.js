import firebase from 'firebase'
import config from './firebase-config'

if (firebase.apps.length === 0) {
  firebase.initializeApp(config)
}

export async function userWithIDExists(id) {
  const doc = await firebase.firestore().collection('users').doc(id).get()
  return doc.exists
}

export async function userWithNameExists(name) {
  const query = await firebase
    .firestore()
    .collection('users')
    .where('name', '==', name)
    .get()

  return !query.empty
}

export async function getUserByID(id) {
  const doc = await firebase.firestore().collection('users').doc(id).get()
  if (!doc.exists) {
    throw { code: 'user/not-found' }
  }

  const user = doc.data()
  const postDocPromises = user.posts.map(postId => getPostByID(postId))
  user.posts = await Promise.all(postDocPromises)

  return { id: doc.id, ...user }
}

export async function getUserByName(name) {
  const query = await firebase
    .firestore()
    .collection('users')
    .where('name', '==', name)
    .get()

  if (query.empty || !query.docs[0].exists) {
    throw { code: 'user/not-found' }
  }

  const user = { id: query.docs[0].id, ...query.docs[0].data() }
  const postDocPromises = user.posts.map(postId => getPostByID(postId))
  user.posts = await Promise.all(postDocPromises)

  return user
}

export async function getPostByID(id) {
  const doc = await firebase.firestore().collection('posts').doc(id).get()
  if (!doc.exists) {
    throw { code: 'post/not-found' }
  }

  return { id: doc.id, ...doc.data() }
}

export async function removePostForUser(uid, pid) {
  await firebase.firestore().collection('posts').doc(pid).delete()
  firebase
    .firestore()
    .collection('users')
    .doc(uid)
    .update({ posts: firebase.firestore.FieldValue.arrayRemove(pid) })
}

export async function postWithIDExists(id) {
  const doc = await firebase.firestore().collection('posts').doc(id).get()
  return doc.exists
}

export async function postWithUsernameAndSlugExists(username, slug) {
  const user = await getUserByName(username)
  return user.posts.find(post => post.slug === slug)
}

export async function postWithUserIDAndSlugExists(uid, slug) {
  const user = await getUserByID(uid)
  return user.posts.find(post => post.slug === slug)
}

export async function getPostByUsernameAndSlug(username, slug) {
  const user = await getUserByName(username)
  const post = user.posts.find(post => post.slug === slug)
  if (!post) {
    throw { code: 'post/not-found' }
  }

  return post
}

export async function setUser(id, data) {
  await firebase.firestore().collection('users').doc(id).set(data)
}

export async function setPost(id, data) {
  await firebase.firestore().collection('posts').doc(id).set(data)
}

export async function createPostForUser(userId) {
  const doc = await firebase.firestore().collection('posts').add({
    title: '',
    excerpt: '',
    content: '',
    author: userId,
    published: false,
    lastEdited: firebase.firestore.Timestamp.now(),
  })

  await firebase
    .firestore()
    .collection('posts')
    .doc(doc.id)
    .update({ slug: doc.id })

  await firebase
    .firestore()
    .collection('users')
    .doc(userId)
    .update({ posts: firebase.firestore.FieldValue.arrayUnion(doc.id) })

  return doc.id
}
