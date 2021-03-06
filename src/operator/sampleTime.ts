import {Observable} from '../Observable';
import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Scheduler} from '../Scheduler';
import {asap} from '../scheduler/asap';

export function sampleTime<T>(delay: number, scheduler: Scheduler = asap): Observable<T> {
  return this.lift(new SampleTimeOperator(delay, scheduler));
}

class SampleTimeOperator<T> implements Operator<T, T> {
  constructor(private delay: number, private scheduler: Scheduler) {
  }

  call(subscriber: Subscriber<T>) {
    return new SampleTimeSubscriber(subscriber, this.delay, this.scheduler);
  }
}

class SampleTimeSubscriber<T> extends Subscriber<T> {
  lastValue: T;
  hasValue: boolean = false;

  constructor(destination: Subscriber<T>, private delay: number, private scheduler: Scheduler) {
    super(destination);
    this.add(scheduler.schedule(dispatchNotification, delay, { subscriber: this, delay }));
  }

  protected _next(value: T) {
    this.lastValue = value;
    this.hasValue = true;
  }

  notifyNext() {
    if (this.hasValue) {
      this.hasValue = false;
      this.destination.next(this.lastValue);
    }
  }
}

function dispatchNotification<T>(state: any) {
  let { subscriber, delay } = state;
  subscriber.notifyNext();
  (<any>this).schedule(state, delay);
}
