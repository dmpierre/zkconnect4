#### `zkConnect4` - a zkML Nova experiment

<p align="center">
  <a target="_blank" href="https://zkconnect4.dev/"> 
    App
  </a>
</p>

<p align="center">
  <img src="https://github.com/dmpierre/zkconnect4/assets/23149200/252b7b43-f94d-42b8-9afb-cf4f6ad804c0" width="30%" height="30%" />
</p>


Play connect4 against an RL agent and prove its outcome using Nova. 

This project aims at being a pot-pourri of Nova things: zkML (in the vein of [zator](https://github.com/lyronctk/zator)), wasm development and webworker setup. The idea is to lay out how to do development with Nova, from ideation to deployment. 

An extensive writeup can be found [here](https://hackmd.io/lfL00N75R_G4dVVMU_iMsA). We detail how to work with [`wasm-pack`](https://github.com/rustwasm/wasm-pack), how to link [`keras-to-circom`](https://github.com/socathie/keras2circom) with Nova and also how to setup a webworker to run Nova in the background while the app runs on the browser's main thread.

#### Setup and build 

```bash
$ git clone git@github.com:dmpierre/zkconnect4.git && cd zkconnect4
$ pnpm i && pnpm dev
```

