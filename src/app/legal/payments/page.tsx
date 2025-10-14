export const metadata = { title: "Оплата и возвраты — Я есть" };

export default function PaymentsPage() {
  return (
    <main className="prose prose-slate mx-auto max-w-3xl px-4 py-10 space-y-8">
      <h1>Оплата и возвраты</h1>

      <section className="space-y-4">
        <h2>Оплата</h2>
        <p>
          Оплата услуг производится через платёжного провайдера <strong>Т-Банк</strong>.
          Ввод и обработка платёжных данных осуществляется на стороне провайдера;
          мы не получаем и не храним реквизиты карт.
        </p>
      </section>

      <hr className="my-6" />

      <section className="space-y-4">
        <h2>Возвраты</h2>
        <p>
          Возврат средств возможен до момента фактического начала выполнения поручения,
          а также в иных случаях, предусмотренных законом и настоящей Политикой.
        </p>
        <p>
          Для обращения по возврату напишите на{" "}
          <a href="mailto:example@mail.ru">example@mail.ru</a>, указав номер заказа
          и контактные данные.
        </p>
      </section>

      <hr className="my-6" />

      <section className="space-y-4">
        <h2>Документы</h2>
        <p>
          По запросу предоставим подтверждающие документы/квитанции.
          Срок хранения — не менее 5 лет.
        </p>
      </section>

      <hr className="my-6" />

      <section className="space-y-4">
        <h2>Контакты</h2>
        <dl>
          <div>
            <dt>E-mail</dt>
            <dd><a href="mailto:example@mail.ru">example@mail.ru</a></dd>
          </div>
          <div>
            <dt>Телефон</dt>
            <dd><a href="tel:+79233118858">+7&nbsp;923&nbsp;311-88-58</a></dd>
          </div>
          <div>
            <dt>Исполнитель</dt>
            <dd>
              ИП Вогоровский Максим Михайлович, ИНН 244316923490, ОГРНИП 320246800081987
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
