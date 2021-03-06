import * as React from 'react'
import { events } from 'src/managers'
import { UNDO_OR_REDO_TRIGGERED, PUSH_UNDO_STACK } from 'src/constants/EventTags'
import dva from 'dva'
import { Router, Route } from 'dva/router';
import mapModel from 'src/models/map'
import sheetModel from 'src/models/sheet'
import appModel from 'src/models/app'
import AppComponent from 'src/components'
import { undoMiddleware, undoGlobalReducer, hooks } from './middlewares/undo'
import { createActionSocketMiddleware, createSyncStoreSocketMiddleware } from './middlewares/ws'

class AppStarter {

  /**
   * @description dva's export object
   * */
  private app: any;

  constructor() {
    this.initUndoMiddlewareHooks();
  }

  private initUndoMiddlewareHooks() {
    hooks.onUndoOrRedoTrigger = () => events.emit(UNDO_OR_REDO_TRIGGERED);
    hooks.onPushUndo = () => events.emit(PUSH_UNDO_STACK);
  }

  /**
   * @description init dva with initialState
   * */
  public start({initialState, wrapperElem, wsInstance}) {
    this.app = dva({
      initialState,
      globalReducer: undoGlobalReducer
    });

    this.setAllModels();
    this.setRouter();
    this.setMiddleware(wsInstance);

    this.app.start(wrapperElem);
  }

  /**
   * @description a proxy for store.dispatch
   * */
  public dispatch(...args) {
    return this.app._store.dispatch(...args);
  }

  public getState() {
    return this.app._store.getState();
  }

  private setAllModels() {
    this.app.model(appModel);
    this.app.model(mapModel);
    this.app.model(sheetModel);
  }

  private setMiddleware(wsInstance) {
    // todo
    this.app.use({
      onAction: [undoMiddleware, createActionSocketMiddleware(wsInstance), createSyncStoreSocketMiddleware(wsInstance)]
    });
  }

  private setRouter() {
    this.app.router(({ history }) => {
      return (
        <Router history={history}>
          <Route path="/" component={AppComponent} />
        </Router>
      );
    });
  }
}

export default new AppStarter()