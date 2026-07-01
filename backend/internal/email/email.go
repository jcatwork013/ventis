package email

import (
	"fmt"
	"log"
	"net/smtp"
	"strings"
)

// Message is a single outbound email.
type Message struct {
	To      string
	Subject string
	Body    string
}

// Sender delivers messages. Implementations must be safe for concurrent use.
type Sender interface {
	Send(Message) error
}

// NoopSender logs messages instead of sending — used in development.
type NoopSender struct{}

func (NoopSender) Send(m Message) error {
	log.Printf("[email:noop] to=%s subject=%q\n%s", m.To, m.Subject, m.Body)
	return nil
}

// SMTPSender delivers via a standard SMTP relay.
type SMTPSender struct {
	Host string
	Port string
	User string
	Pass string
	From string
}

func (s SMTPSender) Send(m Message) error {
	addr := fmt.Sprintf("%s:%s", s.Host, s.Port)
	auth := smtp.PlainAuth("", s.User, s.Pass, s.Host)
	msg := strings.Join([]string{
		"From: " + s.From,
		"To: " + m.To,
		"Subject: " + m.Subject,
		"MIME-Version: 1.0",
		"Content-Type: text/plain; charset=UTF-8",
		"",
		m.Body,
	}, "\r\n")
	return smtp.SendMail(addr, auth, s.From, []string{m.To}, []byte(msg))
}

// Worker delivers messages asynchronously through a buffered channel so HTTP
// handlers never block on SMTP latency.
type Worker struct {
	sender Sender
	queue  chan Message
}

// NewWorker starts a background goroutine that drains the queue.
func NewWorker(sender Sender, buffer int) *Worker {
	w := &Worker{sender: sender, queue: make(chan Message, buffer)}
	go w.run()
	return w
}

func (w *Worker) run() {
	for m := range w.queue {
		if err := w.sender.Send(m); err != nil {
			log.Printf("[email] send failed to=%s: %v", m.To, err)
		}
	}
}

// Enqueue schedules a message for delivery. It drops the message (with a log)
// rather than blocking if the queue is full.
func (w *Worker) Enqueue(m Message) {
	select {
	case w.queue <- m:
	default:
		log.Printf("[email] queue full, dropping message to=%s", m.To)
	}
}

// Close stops the worker after draining queued messages.
func (w *Worker) Close() { close(w.queue) }
