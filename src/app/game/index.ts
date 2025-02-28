import {init} from '../../engine/sys'
import * as AppSys from './sys'
import { UIHooks } from './sys'

export default async (args: string, hooks: UIHooks) => {
  AppSys.registerHooks(hooks)
  await init(args, AppSys)
  return AppSys
}