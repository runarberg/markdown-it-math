# Euler’s identity

In mathematics, **Euler’s identity** (also known as _Euler’s
equation_) is the equality
$$ e^(i pi) + 1 = 0 $$
where

- $e$ is Euler's number, the base of natural logarithms,
- $i$ is the imaginary unit, which by definition satisfies $i^2 = -1$,
  and
- $pi$ is pi, the ratio of the circumference of a circle to its
  diameter.

Euler’s identity is named after the Swiss mathematician Leonhard
Euler. It is a special case of Euler’s formula $e^(ix) = cos x + i sin
x$ when evaluated for $x=pi$. Euler's identity is considered an
exemplar of mathematical beauty, as it shows a profound connection
between the most fundamental numbers in mathematics. In addition, it
is directly used in a proof that $pi$ is transcendental, which implies
the impossibility of squaring the circle.

## Imaginary exponents

Euler’s identity asserts that $e^(i pi)$ is equal to $-1$. The
expression $e^(i pi)$ is a special case of the expression $e^z$, where
$z$ is any complex number. In general, $e^z$ is defined for complex $z$
by extending one of the definitions of the exponential function from
real exponents to complex exponents. For example, one common
definition is:

$$
e^z = lim_(n->oo) (1 + z/n)^n.
$$

Euler’s identity therefore states that the limit, as $n$ approaches
infinity, of $(1 + (i pi)/n)^n$ is equal to $-1$.

Euler’s identity is a special case of Euler’s formula, which states
that for any real number $x$,

$$ e^(ix) = cos x + i sin x $$

where the inputs of the trigonometric functions sine and cosine are
given in radians.

![Euler's formula for a general angle](https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Euler%27s_formula.svg/330px-Euler%27s_formula.svg.png)

In particular, when $x = pi$,

$$
e^(i pi) = cos pi + i sin pi.
$$

Since
$$ cos pi = -1 $$
and
$$ sin pi = 0 $$

it follows that
$$ e^(i pi) = -1 + 0i, $$

which yields Euler's identity:

$$ e^(i pi) + 1 = 0. $$

## Generalizations

Euler’s identity is also a special case of the more general identity
that the $n$th roots of unity, for $n > 1$, add up to $0$:

$$
sum_(k=0)^(n-1) e^(2pi i k/n) = 0 .
$$

Euler’s identity is the case where $n = 2$.

A similar identity also applies to quaternion exponential: let ${i, j,
k}$ be the basis quaternions; then,

$$
e^(1/sqrt(3) (i +- j +- k) pi) + 1 = 0 .
$$

More generally, let q be a quaternion with a zero real part and a norm
equal to $1$; that is, $q = ai + bj + ck$, with $a^2 + b^2 + c^2 =
1$. Then one has

$$
e^(q pi) + 1 = 0 .
$$

The same formula applies to octonions, with a zero real part and a
norm equal to $1$. These formulas are a direct generalization of
Euler’s identity, since $i$ and $-i$ are the only complex numbers with
a zero real part and a norm (absolute value) equal to $1$.
